const DEMO_PASSWORD = "asdfg";
const DEMO_USER_EMAIL = "test@gmail.com";
const DEMO_ADMIN_EMAIL = "admin@gmail.com";

const demoNow = Date.now();
const hoursAgo = (hours) => new Date(demoNow - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days) => new Date(demoNow - days * 24 * 60 * 60 * 1000).toISOString();

const clone = (value) => JSON.parse(JSON.stringify(value));

const demoUsers = {
  user: {
    email: DEMO_USER_EMAIL,
    username: "Test User",
    user_id: 101,
    role: "user",
    team_id: null,
    team_name: null,
  },
  admin: {
    email: DEMO_ADMIN_EMAIL,
    username: "Demo Admin",
    user_id: 201,
    role: "admin",
    team_id: 6,
    team_name: "General Support",
  },
};

const demoState = {
  nextTicketId: 4000,

  teams: [
    { team_id: 1, team_name: "Digital Banking" },
    { team_id: 2, team_name: "Accounts & KYC" },
    { team_id: 3, team_name: "Cards & Payments" },
    { team_id: 4, team_name: "Loans & EMI" },
    { team_id: 5, team_name: "Fraud & Security" },
    { team_id: 6, team_name: "General Support" },
  ],

  tickets: [
    {
      ticket_id: 3001,
      ticket_title: "UPI payment debited but not received",
      ticket_desc: "Amount deducted but receiver didn’t get money.",
      status: "Forwarded",
      created_at: daysAgo(2),
      resolved_at: null,
      user_name: demoUsers.user.username,
      user_email: demoUsers.user.email,
      team_id: 3,
      team_name: "Cards & Payments",
      ai_team_id: 1,
    },
    {
      ticket_id: 3002,
      ticket_title: "Suspicious login detected",
      ticket_desc: "Login from unknown device.",
      status: "Resolved",
      created_at: daysAgo(4),
      resolved_at: hoursAgo(10),
      user_name: demoUsers.user.username,
      user_email: demoUsers.user.email,
      team_id: 5,
      team_name: "Fraud & Security",
      ai_team_id: 2,
    },
    {
      ticket_id: 3003,
      ticket_title: "Unable to update KYC details",
      ticket_desc: "PAN upload failing.",
      status: "Resolved",
      created_at: daysAgo(1),
      resolved_at: hoursAgo(5),
      user_name: demoUsers.user.username,
      user_email: demoUsers.user.email,
      team_id: 2,
      team_name: "Accounts & KYC",
      ai_team_id: 2,
    },
    {
      ticket_id: 3004,
      ticket_title: "Loan EMI auto-debit failed",
      ticket_desc: "EMI not deducted.",
      status: "Initiated",
      created_at: hoursAgo(12),
      resolved_at: null,
      user_name: demoUsers.user.username,
      user_email: demoUsers.user.email,
      team_id: 4,
      team_name: "Loans & EMI",
      ai_team_id: 4,
    },
    {
      ticket_id: 3005,
      ticket_title: "Card declined internationally",
      ticket_desc: "Card not working abroad.",
      status: "Forwarded",
      created_at: daysAgo(3),
      resolved_at: null,
      user_name: demoUsers.user.username,
      user_email: demoUsers.user.email,
      team_id: 3,
      team_name: "Cards & Payments",
      ai_team_id: 6,
    },
    {
      ticket_id: 3006,
      ticket_title: "Account locked after attempts",
      ticket_desc: "Unable to login.",
      status: "Resolved",
      created_at: daysAgo(6),
      resolved_at: hoursAgo(2),
      user_name: demoUsers.user.username,
      user_email: demoUsers.user.email,
      team_id: 1,
      team_name: "Digital Banking",
      ai_team_id: 1,
    },
  ],

  flows: {
    3001: [
      { flow_id: 1, action: "CREATED", created_at: daysAgo(2), remarks: "User reported UPI issue." },
      { flow_id: 2, action: "FORWARDED", created_at: daysAgo(2), from_team_name: "Digital Banking", to_team_name: "General Support", remarks: "Initial routing." },
      { flow_id: 3, action: "FORWARDED", created_at: daysAgo(1), from_team_name: "General Support", to_team_name: "Cards & Payments", remarks: "Correct team identified." },
    ],

    3002: [
      { flow_id: 4, action: "CREATED", created_at: daysAgo(4), remarks: "Suspicious login alert." },
      { flow_id: 5, action: "FORWARDED", created_at: daysAgo(4), from_team_name: "Accounts & KYC", to_team_name: "Fraud & Security", remarks: "Escalated." },
      { flow_id: 6, action: "RESOLVED", created_at: hoursAgo(10), remarks: "Account secured." },
    ],

    3003: [
      { flow_id: 7, action: "CREATED", created_at: daysAgo(1), remarks: "KYC issue." },
      { flow_id: 8, action: "RESOLVED", created_at: hoursAgo(5), remarks: "Fixed." },
    ],

    3004: [
      { flow_id: 9, action: "CREATED", created_at: hoursAgo(12), remarks: "EMI issue reported." },
    ],

    3005: [
      { flow_id: 10, action: "CREATED", created_at: daysAgo(3), remarks: "Card declined." },
      { flow_id: 11, action: "FORWARDED", created_at: daysAgo(3), from_team_name: "General Support", to_team_name: "Cards & Payments", remarks: "Sent to cards." },
      { flow_id: 12, action: "FORWARDED", created_at: daysAgo(2), from_team_name: "Cards & Payments", to_team_name: "Fraud & Security", remarks: "Check fraud." },
      { flow_id: 13, action: "FORWARDED", created_at: daysAgo(1), from_team_name: "Fraud & Security", to_team_name: "Cards & Payments", remarks: "No fraud." },
    ],

    3006: [
      { flow_id: 14, action: "CREATED", created_at: daysAgo(6), remarks: "Account locked." },
      { flow_id: 15, action: "FORWARDED", created_at: daysAgo(5), from_team_name: "General Support", to_team_name: "Digital Banking", remarks: "Login issue." },
      { flow_id: 16, action: "RESOLVED", created_at: hoursAgo(2), remarks: "Unlocked." },
    ],
  },

  chatHistory: {
    [DEMO_USER_EMAIL]: [
      { sender: "ai", text: "Hi! I am your banking assistant." },
    ],
    [DEMO_ADMIN_EMAIL]: [
      { sender: "ai", text: "Hi Admin, monitoring tickets." },
    ],
  },
};

const isDemoEmail = (email = "") =>
  [DEMO_USER_EMAIL, DEMO_ADMIN_EMAIL].includes(String(email).trim().toLowerCase());

const getDemoRoleFromEmail = (email = "") => {
  const normalized = String(email).trim().toLowerCase();
  if (normalized === DEMO_USER_EMAIL) return "user";
  if (normalized === DEMO_ADMIN_EMAIL) return "admin";
  return null;
};

const createDemoAuth = (email) => {
  const role = getDemoRoleFromEmail(email);
  if (!role) return null;

  const profile = demoUsers[role];
  return {
    token: `demo-${role}-token`,
    ...profile,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    isDemo: true,
  };
};

const isDemoToken = (token = "") => String(token).startsWith("demo-");

const getDemoTeams = () => clone(demoState.teams);

const getDemoUserTickets = (email) =>
  clone(
    demoState.tickets
      .filter((t) => t.user_email === email)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  );

const getDemoTeamTickets = () => {
  const grouped = { active: [], forwarded: [], resolved: [] };

  demoState.tickets.forEach((t) => {
    if (t.status === "Resolved") grouped.resolved.push(t);
    else if (t.status === "Forwarded") grouped.forwarded.push(t);
    else grouped.active.push(t);
  });

  return clone(grouped);
};

const getDemoTicketById = (id) =>
  clone(demoState.tickets.find((t) => String(t.ticket_id) === String(id)));

const getDemoTicketFlow = (id) => clone(demoState.flows[id] || []);

const createDemoTicket = ({ ticket_title, ticket_desc, team_id }, user) => {
  const id = demoState.nextTicketId++;
  const team = demoState.teams.find((t) => t.team_id == team_id);

  const ticket = {
    ticket_id: id,
    ticket_title,
    ticket_desc,
    status: "Initiated",
    created_at: new Date().toISOString(),
    resolved_at: null,
    user_name: user.username,
    user_email: user.email,
    team_id: team?.team_id,
    team_name: team?.team_name,
    ai_team_id: team?.team_id,
  };

  demoState.tickets.unshift(ticket);
  demoState.flows[id] = [
    {
      flow_id: Date.now(),
      action: "CREATED",
      created_at: ticket.created_at,
      remarks: "Created from UI",
    },
  ];

  return clone(ticket);
};

const resolveDemoTicket = (id, data = {}) => {
  const ticket = demoState.tickets.find((t) => t.ticket_id == id);
  ticket.status = "Resolved";
  ticket.resolved_at = new Date().toISOString();

  demoState.flows[id].push({
    flow_id: Date.now(),
    action: "RESOLVED",
    created_at: new Date().toISOString(),
    remarks: data.remarks || "Resolved",
  });

  return clone(ticket);
};

const forwardDemoTicket = (id, data = {}) => {
  const ticket = demoState.tickets.find((t) => t.ticket_id == id);
  const team = demoState.teams.find((t) => t.team_id == data.to_team_id);

  const from = ticket.team_name;

  ticket.status = "Forwarded";
  ticket.team_id = team.team_id;
  ticket.team_name = team.team_name;

  demoState.flows[id].push({
    flow_id: Date.now(),
    action: "FORWARDED",
    created_at: new Date().toISOString(),
    from_team_name: from,
    to_team_name: team.team_name,
    remarks: data.remarks || "Forwarded",
  });

  return clone(ticket);
};

const getDemoChatHistory = (email) => {
  const key = String(email || DEMO_USER_EMAIL).trim().toLowerCase();
  return clone({ messages: demoState.chatHistory[key] || [] });
};

const getDemoAIResponse = (prompt) => {
  const trimmed = String(prompt || "").trim();
  return {
    reply: trimmed
      ? `Demo reply: I received "${trimmed}" and will assist you.`
      : "Please type something.",
  };
};

const addDemoChatMessage = (email, message) => {
  const key = String(email || DEMO_USER_EMAIL).trim().toLowerCase();

  if (!demoState.chatHistory[key]) {
    demoState.chatHistory[key] = [];
  }

  demoState.chatHistory[key].push(message);

  return clone({ messages: demoState.chatHistory[key] });
};

const clearDemoChatHistory = (email) => {
  const key = String(email || DEMO_USER_EMAIL).trim().toLowerCase();
  demoState.chatHistory[key] = [];
  return { success: true };
};

const deleteDemoTicket = (ticketId) => {
  const id = String(ticketId);

  demoState.tickets = demoState.tickets.filter(
    (ticket) => String(ticket.ticket_id) !== id
  );

  delete demoState.flows[id];

  return { success: true };
};

export {
  DEMO_PASSWORD,
  DEMO_USER_EMAIL,
  DEMO_ADMIN_EMAIL,
  isDemoEmail,
  isDemoToken,
  getDemoRoleFromEmail,
  createDemoAuth,
  getDemoTeams,
  getDemoUserTickets,
  getDemoTeamTickets,
  getDemoTicketById,
  getDemoTicketFlow,
  createDemoTicket,
  deleteDemoTicket,
  resolveDemoTicket,
  forwardDemoTicket,
  getDemoChatHistory,
  getDemoAIResponse,
  addDemoChatMessage,
  clearDemoChatHistory,
};