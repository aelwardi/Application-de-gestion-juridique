import { pool } from "../src/config/database.config";
import bcrypt from "bcrypt";

const seedAll = async () => {
  try {
    console.log("🌱 Starting complete database seeding...\n");

    // ========================================
    // 0. CLEAR EXISTING DATA
    // ========================================
    console.log("🗑️  Clearing existing data...");
    await pool.query("DELETE FROM appointments");
    await pool.query("DELETE FROM cases");
    await pool.query("DELETE FROM lawyers");
    await pool.query("DELETE FROM clients");
    await pool.query("DELETE FROM users WHERE role != 'admin'");
    console.log("✓ Data cleared\n");

    // ========================================
    // 1. CREATE LAWYERS (Users + Lawyers)
    // ========================================
    console.log("👨‍⚖️ Creating lawyers...");
    
    const lawyers = [
      {
        email: "avocat1@test.com",
        firstName: "Marie",
        lastName: "Dubois",
        phone: "+33612345678",
        barNumber: "BAR001",
        specialties: ["Droit civil", "Droit de la famille"],
        officeAddress: "15 Rue de la Paix, 75002 Paris",
        bio: "Avocate spécialisée en droit civil et droit de la famille avec 10 ans d'expérience",
        yearsOfExperience: 10
      },
      {
        email: "avocat2@test.com",
        firstName: "Pierre",
        lastName: "Martin",
        phone: "+33612345679",
        barNumber: "BAR002",
        specialties: ["Droit pénal", "Droit des affaires"],
        officeAddress: "23 Avenue des Champs-Élysées, 75008 Paris",
        bio: "Avocat expert en droit pénal et droit des affaires depuis 15 ans",
        yearsOfExperience: 15
      },
      {
        email: "avocat3@test.com",
        firstName: "Sophie",
        lastName: "Bernard",
        phone: "+33612345680",
        barNumber: "BAR003",
        specialties: ["Droit du travail", "Droit social"],
        officeAddress: "8 Boulevard Saint-Germain, 75005 Paris",
        bio: "Spécialiste du droit du travail et du droit social",
        yearsOfExperience: 8
      }
    ];

    const password = await bcrypt.hash("password123", 10);
    const lawyerIds: string[] = [];

    for (const lawyer of lawyers) {
      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified)
         VALUES ($1, $2, 'avocat', $3, $4, $5, true, true)
         RETURNING id`,
        [lawyer.email, password, lawyer.firstName, lawyer.lastName, lawyer.phone]
      );
      const userId = userResult.rows[0].id;

      // Create lawyer profile
      const lawyerResult = await pool.query(
        `INSERT INTO lawyers (user_id, bar_number, specialties, office_address, description, experience_years)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          userId,
          lawyer.barNumber,
          lawyer.specialties,
          lawyer.officeAddress,
          lawyer.bio,
          lawyer.yearsOfExperience
        ]
      );
      lawyerIds.push(lawyerResult.rows[0].id);
      console.log(`  ✓ Created lawyer: ${lawyer.firstName} ${lawyer.lastName} (ID: ${lawyerResult.rows[0].id})`);
    }

    // ========================================
    // 2. CREATE CLIENTS (Users + Clients)
    // ========================================
    console.log("\n👥 Creating clients...");
    
    const clients = [
      {
        email: "client1@test.com",
        firstName: "Jean",
        lastName: "Dupont",
        phone: "+33612345681",
        address: "10 Rue de Rivoli",
        city: "Paris",
        postalCode: "75001"
      },
      {
        email: "client2@test.com",
        firstName: "Anne",
        lastName: "Leroy",
        phone: "+33612345682",
        address: "25 Avenue Montaigne",
        city: "Paris",
        postalCode: "75008"
      },
      {
        email: "client3@test.com",
        firstName: "Thomas",
        lastName: "Petit",
        phone: "+33612345683",
        address: "5 Boulevard Haussmann",
        city: "Paris",
        postalCode: "75009"
      },
      {
        email: "client4@test.com",
        firstName: "Laura",
        lastName: "Moreau",
        phone: "+33612345684",
        address: "12 Rue du Faubourg Saint-Honoré",
        city: "Paris",
        postalCode: "75008"
      },
      {
        email: "client5@test.com",
        firstName: "David",
        lastName: "Rousseau",
        phone: "+33612345685",
        address: "18 Avenue Victor Hugo",
        city: "Paris",
        postalCode: "75016"
      }
    ];

    const clientIds: string[] = [];

    for (const client of clients) {
      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, is_verified)
         VALUES ($1, $2, 'client', $3, $4, $5, true, true)
         RETURNING id`,
        [client.email, password, client.firstName, client.lastName, client.phone]
      );
      const userId = userResult.rows[0].id;

      // Create client profile
      const clientResult = await pool.query(
        `INSERT INTO clients (user_id, address, city, postal_code)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, client.address, client.city, client.postalCode]
      );
      clientIds.push(clientResult.rows[0].id);
      console.log(`  ✓ Created client: ${client.firstName} ${client.lastName} (ID: ${clientResult.rows[0].id})`);
    }

    // ========================================
    // 3. CREATE CASES
    // ========================================
    console.log("\n📂 Creating cases...");
    
    const caseTypes = [
      "Divorce",
      "Droit du travail",
      "Droit pénal",
      "Droit commercial",
      "Succession",
      "Contrat",
      "Litige civil"
    ];

    const statuses = ["pending", "in_progress", "on_hold", "closed"];
    const priorities = ["low", "medium", "high", "urgent"];
    
    const caseIds: string[] = [];
    const casesCount = 12; // 12 cases

    for (let i = 0; i < casesCount; i++) {
      const lawyerId = lawyerIds[i % lawyerIds.length];
      const clientId = clientIds[i % clientIds.length];
      const caseType = caseTypes[i % caseTypes.length];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const caseNumber = `CASE-2025-${String(i + 1).padStart(4, '0')}`;
      const title = `${caseType} - ${caseNumber}`;
      const description = `Dossier de type ${caseType} pour le client`;
      
      const openingDate = new Date();
      openingDate.setDate(openingDate.getDate() - Math.floor(Math.random() * 180)); // Dans les 6 derniers mois

      const caseResult = await pool.query(
        `INSERT INTO cases (
          case_number, title, description, case_type, status, priority,
          client_id, lawyer_id, opening_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          caseNumber,
          title,
          description,
          caseType,
          status,
          priority,
          clientId,
          lawyerId,
          openingDate
        ]
      );
      caseIds.push(caseResult.rows[0].id);
      console.log(`  ✓ Created case: ${caseNumber} - ${status}`);
    }

    // ========================================
    // 4. CREATE APPOINTMENTS
    // ========================================
    console.log("\n📅 Creating appointments...");
    
    const appointmentTypes = [
      "consultation",
      "tribunal",
      "rencontre_client",
      "expertise",
      "mediation"
    ];
    
    const appointmentStatuses = ["scheduled", "confirmed", "completed", "cancelled"];
    const locationTypes = ["office", "court", "client_location", "online"];
    
    const appointmentsCount = 25; // 25 appointments
    
    for (let i = 0; i < appointmentsCount; i++) {
      const lawyerId = lawyerIds[i % lawyerIds.length];
      const clientId = clientIds[i % clientIds.length];
      const caseId = i < caseIds.length ? caseIds[i] : caseIds[Math.floor(Math.random() * caseIds.length)];
      
      const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
      const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)];
      
      // Create appointments in the past, present and future
      const daysOffset = Math.floor(Math.random() * 120) - 30; // -30 à +90 jours
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + daysOffset);
      startDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9h-17h
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1); // 1 hour duration
      
      const status = daysOffset < 0 
        ? "completed" 
        : appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)];
      
      let locationAddress = null;
      let locationLatitude = null;
      let locationLongitude = null;
      let meetingUrl = null;
      
      if (locationType === "office") {
        locationAddress = "15 Rue de la Paix, 75002 Paris";
        locationLatitude = 48.8566;
        locationLongitude = 2.3522;
      } else if (locationType === "court") {
        locationAddress = "Tribunal de Grande Instance, 4 Bd du Palais, 75001 Paris";
        locationLatitude = 48.8556;
        locationLongitude = 2.3462;
      } else if (locationType === "client_location") {
        locationAddress = "Adresse du client";
        locationLatitude = 48.8566 + (Math.random() * 0.1);
        locationLongitude = 2.3522 + (Math.random() * 0.1);
      } else if (locationType === "online") {
        meetingUrl = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;
      }
      
      await pool.query(
        `INSERT INTO appointments (
          case_id, lawyer_id, client_id, appointment_type, title, description,
          start_time, end_time, location_type, location_address,
          location_latitude, location_longitude, meeting_url, status, reminder_sent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          caseId,
          lawyerId,
          clientId,
          appointmentType,
          `${appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)} - Rendez-vous`,
          `Rendez-vous de type ${appointmentType} avec le client`,
          startDate,
          endDate,
          locationType,
          locationAddress,
          locationLatitude,
          locationLongitude,
          meetingUrl,
          status,
          status === "completed"
        ]
      );
      console.log(`  ✓ Created appointment: ${appointmentType} - ${startDate.toLocaleDateString()} - ${status}`);
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("✅ Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`  - Lawyers: ${lawyerIds.length}`);
    console.log(`  - Clients: ${clientIds.length}`);
    console.log(`  - Cases: ${caseIds.length}`);
    console.log(`  - Appointments: ${appointmentsCount}`);
    console.log("\n🔐 Login credentials:");
    console.log("  Email: avocat1@test.com (ou avocat2@test.com, avocat3@test.com)");
    console.log("  Password: password123");
    console.log("  Email: client1@test.com (ou client2@test.com, etc.)");
    console.log("  Password: password123");
    console.log("=".repeat(60) + "\n");

  } catch (error: any) {
    console.error("❌ Seeding failed:", error);
    if (error.code === "23505") {
      console.log("💡 Tip: Data might already exist. Try clearing the database first.");
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedAll();
