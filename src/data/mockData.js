// Mock data for the application

export const mockRequests = [
    {
      id: "REQ001",
      vehicleType: "Sedan",
      purpose: "Airport Pickup",
      date: "2026-02-20",
      time: "09:00",
      destination: "JFK Airport",
      passengers: 2,
      status: "Approved",
      createdAt: "2026-02-18T10:30:00Z"
    },
    {
      id: "REQ002",
      vehicleType: "SUV",
      purpose: "Client Meeting",
      date: "2026-02-21",
      time: "14:30",
      destination: "Downtown Office",
      passengers: 4,
      status: "Pending",
      createdAt: "2026-02-19T08:15:00Z"
    },
    {
      id: "REQ003",
      vehicleType: "Van",
      purpose: "Team Outing",
      date: "2026-02-22",
      time: "10:00",
      destination: "Beach Resort",
      passengers: 8,
      status: "In Progress",
      createdAt: "2026-02-17T14:20:00Z"
    },
    {
      id: "REQ004",
      vehicleType: "Truck",
      purpose: "Equipment Transport",
      date: "2026-02-19",
      time: "11:00",
      destination: "Warehouse",
      passengers: 2,
      status: "Completed",
      createdAt: "2026-02-16T09:45:00Z"
    },
    {
      id: "REQ005",
      vehicleType: "Sedan",
      purpose: "Personal Errand",
      date: "2026-02-23",
      time: "15:00",
      destination: "Shopping Mall",
      passengers: 1,
      status: "Rejected",
      createdAt: "2026-02-19T11:30:00Z"
    }
  ];
  
  export const mockComplaints = [
    {
      id: "CMP001",
      category: "Vehicle Issue",
      description: "Air conditioning not working properly",
      attachments: [],
      status: "Resolved",
      createdAt: "2026-02-15T09:20:00Z",
      resolvedAt: "2026-02-17T14:30:00Z"
    },
    {
      id: "CMP002",
      category: "Driver Behavior",
      description: "Driver was late by 30 minutes",
      attachments: [],
      status: "Under Review",
      createdAt: "2026-02-18T16:45:00Z"
    },
    {
      id: "CMP003",
      category: "Delay",
      description: "Vehicle arrived 20 minutes late",
      attachments: ["screenshot.png"],
      status: "Received",
      createdAt: "2026-02-19T10:15:00Z"
    }
  ];
  
  export const mockNotifications = [
    {
      id: "NOT001",
      title: "Request Approved",
      message: "Your vehicle request REQ001 has been approved.",
      type: "success",
      read: false,
      createdAt: "2026-02-19T09:30:00Z"
    },
    {
      id: "NOT002",
      title: "Complaint Update",
      message: "Your complaint CMP001 has been resolved.",
      type: "info",
      read: true,
      createdAt: "2026-02-17T15:00:00Z"
    },
    {
      id: "NOT003",
      title: "Vehicle Assignment",
      message: "Vehicle assigned for request REQ002: Toyota Camry (Plate: ABC-1234)",
      type: "info",
      read: false,
      createdAt: "2026-02-19T11:15:00Z"
    },
    {
      id: "NOT004",
      title: "Trip Reminder",
      message: "Your trip to JFK Airport is tomorrow at 09:00 AM.",
      type: "warning",
      read: false,
      createdAt: "2026-02-19T12:00:00Z"
    }
  ];
  
  export const vehicleTypes = [
    "Sedan",
    "SUV",
    "Van",
    "Truck",
    "Bus"
  ];