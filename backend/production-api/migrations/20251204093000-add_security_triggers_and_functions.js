'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    const tableDesc = await queryInterface.describeTable('door_status');
    if (!tableDesc.hash_val) {
      await queryInterface.addColumn('door_status', 'hash_val', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION public.compute_hash_for_row(
        p_id bigint,
        p_name text,
        p_location text,
        p_locked boolean,
        p_battery_level smallint,
        p_last_update timestamp with time zone,
        p_wifi_strength text,
        p_camera_active boolean
      )
      RETURNS text
      LANGUAGE sql
      AS $$
      SELECT encode(
        digest(
          coalesce(p_id::text,'') || '|' ||
          coalesce(p_name,'') || '|' ||
          coalesce(p_location,'') || '|' ||
          coalesce(p_locked::text,'') || '|' ||
          coalesce(p_battery_level::text,'') || '|' ||
          coalesce(p_last_update::text,'') || '|' ||
          coalesce(p_wifi_strength,'') || '|' ||
          coalesce(p_camera_active::text,'')
        , 'sha256')
      , 'hex');
      $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION public.trigger_set_hash()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      BEGIN
        NEW.hash_val := compute_hash_for_row(
          NEW.id,
          NEW.name,
          NEW.location,
          NEW.locked,
          NEW.battery_level,
          NEW.last_update,
          NEW.wifi_strength::text,
          NEW.camera_active
        );
        RETURN NEW;
      END;
      $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION public.trigger_verify_integrity()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      DECLARE
        expected_old_hash text;
        session_trusted text;
      BEGIN
        expected_old_hash := compute_hash_for_row(
          OLD.id,
          OLD.name,
          OLD.location,
          OLD.locked,
          OLD.battery_level,
          OLD.last_update,
          OLD.wifi_strength::text,
          OLD.camera_active
        );

        IF OLD.hash_val IS NULL OR OLD.hash_val <> expected_old_hash THEN
          RAISE EXCEPTION 'integrity check failed: existing row hash mismatch. Operation aborted.';
        END IF;

        session_trusted := current_setting('app.trusted_caller', true);

        IF TG_OP = 'UPDATE' THEN
          IF NEW.locked IS DISTINCT FROM OLD.locked THEN
            IF session_trusted IS NULL OR session_trusted <> '1' THEN
              RAISE EXCEPTION 'unauthorized change to locked column. Only trusted caller may change locked.';
            END IF;
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$;
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION public.encrypt_face_data()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $$
      DECLARE
          key TEXT := current_setting('app.encryption_key', true);
      BEGIN
          IF NEW.face_data IS NOT NULL THEN
              NEW.face_data := pgp_sym_encrypt_bytea(NEW.face_data, key);
          END IF;
          RETURN NEW;
      END;
      $$;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_set_hash ON public.door_status;
      CREATE TRIGGER trg_set_hash
      BEFORE INSERT OR UPDATE ON public.door_status
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_set_hash();
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_verify_integrity ON public.door_status;
      CREATE TRIGGER trg_verify_integrity
      BEFORE DELETE OR UPDATE ON public.door_status
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_verify_integrity();
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_encrypt_face_data ON public.users;
      CREATE TRIGGER trg_encrypt_face_data
      BEFORE INSERT OR UPDATE OF face_data ON public.users
      FOR EACH ROW
      EXECUTE FUNCTION public.encrypt_face_data();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trg_encrypt_face_data ON public.users;
      DROP TRIGGER IF EXISTS trg_verify_integrity ON public.door_status;
      DROP TRIGGER IF EXISTS trg_set_hash ON public.door_status;
    `);

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS public.encrypt_face_data();
      DROP FUNCTION IF EXISTS public.trigger_verify_integrity();
      DROP FUNCTION IF EXISTS public.trigger_set_hash();
      DROP FUNCTION IF EXISTS public.compute_hash_for_row(
        bigint, text, text, boolean, smallint, timestamp with time zone, text, boolean
      );
    `);

    const tableDesc = await queryInterface.describeTable('door_status');
    if (tableDesc.hash_val) {
      await queryInterface.removeColumn('door_status', 'hash_val');
    }
  }
};
