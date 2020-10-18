export const resources = {
    USER: "User",
    DIVE: "Dive",
    CLUB: "Club",
    GEAR: "Gear",
    GROUP: "Group",
    MESSAGE: "Message",
};

export const errorCodes = {
    CANNOT_ADD_YOURSELF: "You cannot send a friend request to yourself.",
    FRIEND_REQUEST_ALREADY_SENT:
        "You have already sent a friend request to this person.",
    ALREADY_FRIENDS: "You are already friends with this person.",
    CLUB_DETAILS_MISSING: "A new club must have both a name and a location.",
    INVALID_AUTH: "Your username and/or password were incorrect.",
    FORBIDDEN: "You do not have access to this resource.",
    NOT_FOUND: "Resource not found.",
    USERNAME_EXISTS: "A user with that username already exists.",
    EMAIL_EXISTS: "A user with that email address already exists.",
    USER_ALREADY_IN_GROUP: "That user is already present in the group.",
    USER_NOT_IN_GROUP: "That user is not a member.",
    INVALID_ARGUMENT_TIME_IN_LATER_THAN_OUT:
        "Time in cannot be later than time out.",
    INVALID_ARGUMENT_DIVE_TIME_EXCEEDED:
        "Bottom and safety stop time cannot exceed dive time (The difference between time in and time out).",
    INVALID_ARGUMENT_ONLY_MANAGER:
        "You cannot remove the only manager of the club.",
    ALREADY_A_MEMBER: "Already a member.",
    NOT_A_MEMBER: "Not a member.",
    ALREADY_A_MANAGER: "Already a manager.",
    NOT_A_MANAGER: "Not a manager.",
};

export const subscriptionKeys = {
    newMessageSubscriptionKey: (id: string): string => `NEW_MESSAGE_${id}`,
};
