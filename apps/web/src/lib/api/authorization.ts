import type { User as Profile } from "@presethub/types";
import { ApiError } from "./errors";

type Subject = { id: string } | string;

const subjectId = (subject: Subject) =>
	typeof subject === "string" ? subject : subject.id;

export function assertAuthorized(
	condition: boolean,
	message = "You do not have permission to perform this action.",
): asserts condition {
	if (!condition) {
		throw new ApiError({ code: "forbidden", message });
	}
}

export function assertSameUser(currentUser: Subject, targetUser: Subject) {
	assertAuthorized(subjectId(currentUser) === subjectId(targetUser));
}

export function assertStaff(profile: Pick<Profile, "is_staff">) {
	assertAuthorized(profile.is_staff);
}

export function assertOwnerOrStaff(
	currentUser: Subject,
	owner: Subject,
	profile?: Pick<Profile, "is_staff">,
) {
	assertAuthorized(
		subjectId(currentUser) === subjectId(owner) || Boolean(profile?.is_staff),
	);
}
