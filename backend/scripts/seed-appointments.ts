import { pool } from "../src/config/database.config";

const seedAppointments = async () => {
  try {
    console.log("🌱 Seeding appointments...");

    // Get existing data - NOW USING lawyers.id and clients.id
    const lawyersResult = await pool.query(
      "SELECT id FROM lawyers LIMIT 1"
    );
    const clientsResult = await pool.query(
      "SELECT id FROM clients LIMIT 1"
    );
    const casesResult = await pool.query(
      "SELECT id FROM cases LIMIT 3"
    );

    if (lawyersResult.rows.length === 0 || clientsResult.rows.length === 0) {
      console.log("⚠️  Please seed users, lawyers and clients first");
      return;
    }

    const lawyerId = lawyersResult.rows[0].id; // This is now lawyers.id
    const clientId = clientsResult.rows[0].id; // This is now clients.id
    const caseIds = casesResult.rows.map((row) => row.id);

    console.log(`✅ Found lawyer ID: ${lawyerId}`);
    console.log(`✅ Found client ID: ${clientId}`);

    // Delete existing appointments
    await pool.query("DELETE FROM appointments");
    console.log("🗑️  Deleted existing appointments");

    // Create appointments for the next 3 months
    const appointments = [];
    const now = new Date();

    // Appointments types
    const types = [
      "consultation",
      "tribunal",
      "rencontre_client",
      "expertise",
      "mediation",
    ];
    const statuses = ["scheduled", "confirmed", "completed"];
    const locationTypes = ["office", "court", "client_location", "online"];

    // Create 15 appointments spread over 3 months
    for (let i = 0; i < 15; i++) {
      // Random date in the next 3 months
      const daysOffset = Math.floor(Math.random() * 90);
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + daysOffset);
      startDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9h-17h

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1); // 1 hour duration

      const appointmentType = types[Math.floor(Math.random() * types.length)];
      const status =
        daysOffset < 0
          ? "completed"
          : statuses[Math.floor(Math.random() * statuses.length)];
      const locationType =
        locationTypes[Math.floor(Math.random() * locationTypes.length)];

      const caseId =
        caseIds.length > 0
          ? caseIds[Math.floor(Math.random() * caseIds.length)]
          : null;

      appointments.push({
        case_id: caseId,
        lawyer_id: lawyerId,
        client_id: clientId,
        appointment_type: appointmentType,
        title: `${appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)} - Rendez-vous`,
        description: `Description pour le rendez-vous de type ${appointmentType}`,
        start_time: startDate,
        end_time: endDate,
        location_type: locationType,
        location_address:
          locationType === "office"
            ? "123 Rue de la Loi, Paris"
            : locationType === "court"
            ? "Tribunal de Grande Instance, Paris"
            : locationType === "client_location"
            ? "Adresse du client"
            : null,
        location_latitude:
          locationType !== "online" ? 48.8566 + Math.random() * 0.1 : null,
        location_longitude:
          locationType !== "online" ? 2.3522 + Math.random() * 0.1 : null,
        meeting_url:
          locationType === "online"
            ? "https://meet.google.com/abc-defg-hij"
            : null,
        status,
        reminder_sent: status === "completed",
        notes: `Notes pour le rendez-vous ${i + 1}`,
      });
    }

    // Insert appointments
    for (const appointment of appointments) {
      await pool.query(
        `INSERT INTO appointments (
          case_id, lawyer_id, client_id, appointment_type, title, description,
          start_time, end_time, location_type, location_address,
          location_latitude, location_longitude, meeting_url,
          status, reminder_sent, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          appointment.case_id,
          appointment.lawyer_id,
          appointment.client_id,
          appointment.appointment_type,
          appointment.title,
          appointment.description,
          appointment.start_time,
          appointment.end_time,
          appointment.location_type,
          appointment.location_address,
          appointment.location_latitude,
          appointment.location_longitude,
          appointment.meeting_url,
          appointment.status,
          appointment.reminder_sent,
          appointment.notes,
        ]
      );
    }

    console.log(`✅ Successfully seeded ${appointments.length} appointments`);

    // Display stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE location_type = 'office') as office,
        COUNT(*) FILTER (WHERE location_type = 'court') as court,
        COUNT(*) FILTER (WHERE location_type = 'online') as online
      FROM appointments
    `);

    console.log("\n📊 Appointments Statistics:");
    console.log(statsResult.rows[0]);

    await pool.end();
  } catch (error) {
    console.error("❌ Error seeding appointments:", error);
    process.exit(1);
  }
};

seedAppointments();
