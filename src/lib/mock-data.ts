
export const mockEvents = [
    {
        id: "1",
        title: "Valorant Tournament",
        description: "5v5 Competitive Tournament",
        event_date: "2024-03-15T10:00:00",
        location: "Main Hall",
        max_participants: 50,
        game: "Valorant",
        created_at: "2024-02-01T12:00:00",
        image_url: null,
    },
    {
        id: "2",
        title: "FIFA 24 Championship",
        description: "1v1 PS5 Tournament",
        event_date: "2024-03-20T14:00:00",
        location: "Gaming Zone",
        max_participants: 32,
        game: "Free Fire", // Just assigning for demo
        created_at: "2024-02-05T15:00:00",
    },
    {
        id: "3",
        title: "BGMI Squad Clash",
        description: "Squad vs Squad",
        event_date: "2024-03-25T16:00:00",
        location: "Online",
        max_participants: 100,
        game: "BGMI",
        created_at: "2024-02-08T10:00:00",
    },
];

export const mockMembers = [
    {
        id: "1",
        username: "pro_gamer_1",
    },
    {
        id: "2",
        username: "newbie_player",
        full_name: "Jane Smith",
        email: "jane@example.com",
        mobile: "9876543211",
        collegeId: "2300012346",
        created_at: "2024-01-15T11:00:00",
        game: "Free Fire",
        user_roles: [{ role: "member" }],
    },
    {
        id: "3",
        username: "bgmi_king",
        full_name: "Rahul Kumar",
        email: "rahul@example.com",
        mobile: "9876543212",
        collegeId: "2300012347",
        created_at: "2024-01-20T14:00:00",
        game: "BGMI",
        user_roles: [{ role: "member" }],
    },
];

export const mockMessages = [
    {
        id: "1",
        name: "Alice Johnson",
        email: "alice@example.com",
        subject: "Collaboration",
        message: "Interested in sponsoring an event.",
        created_at: "2024-02-10T10:00:00",
        is_read: false,
    },
    {
        id: "2",
        name: "Bob Brown",
        email: "bob@example.com",
        subject: "Membership Inquiry",
        message: "How do I join the leaderboard?",
        created_at: "2024-02-12T08:00:00",
        is_read: true,
    },
];
