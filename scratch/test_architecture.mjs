import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

console.log("==================================================");
console.log("RUNNING AMHUB ARCHITECTURE TEST SUITE");
console.log("==================================================\n");

// 1. Test IP Hashing & Salt Protection
console.log("TEST 1: IP Hashing & Privacy (No raw IP exposure)");
function hashIp(ip, salt = "test-salt-secret") {
	return createHmac("sha256", salt).update(ip.trim()).digest("hex");
}
const hash1 = hashIp("192.168.1.1");
const hash2 = hashIp("192.168.1.1");
const hashDiff = hashIp("192.168.1.2");
assert.equal(hash1, hash2, "Identical IP must produce identical hash");
assert.notEqual(hash1, hashDiff, "Different IP must produce different hash");
assert.ok(!hash1.includes("192.168"), "Hash must never leak raw IP");
console.log("✅ Passed: IP Hashing is salted, deterministic, and safe.\n");

// 2. Test Active Follower Trust Evaluation Engine
console.log("TEST 2: Active Follower Scoring (New vs Active vs Spam)");
function evaluateFollowerTrust(user) {
	if (user.isSuspicious) {
		return { userId: user.userId, weight: 0, isActive: false };
	}
	const createdDate = new Date(user.createdAt);
	const now = new Date();
	const ageInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

	let ageScore = 0.1;
	if (ageInDays >= 30) ageScore = 0.4;
	else if (ageInDays >= 7) ageScore = 0.3;
	else if (ageInDays >= 1) ageScore = 0.2;

	let profileScore = 0;
	if (user.hasAvatar) profileScore += 0.1;
	if (user.hasBio) profileScore += 0.1;

	let activityScore = 0;
	if (user.downloadCount > 0) activityScore += 0.15;
	if (user.likeCount > 0 || user.bookmarkCount > 0) activityScore += 0.15;
	if (user.presetCount > 0) activityScore += 0.1;

	let penaltyScore = 0;
	if (ageInDays < 3 && user.followingCount > 30 && user.downloadCount === 0) {
		penaltyScore += 0.4;
	} else if (user.followingCount > 100 && user.downloadCount === 0 && user.presetCount === 0) {
		penaltyScore += 0.3;
	}

	const rawWeight = ageScore + profileScore + activityScore - penaltyScore;
	const weight = Math.max(0, Math.min(1.0, Number(rawWeight.toFixed(2))));
	return { userId: user.userId, weight, isActive: weight >= 0.5 };
}

// Case A: Mature active user
const matureUser = {
	userId: "user-mature",
	createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days old
	hasAvatar: true,
	hasBio: true,
	downloadCount: 5,
	likeCount: 3,
	bookmarkCount: 2,
	presetCount: 1,
	followingCount: 5,
};
const evalMature = evaluateFollowerTrust(matureUser);
assert.ok(evalMature.weight >= 0.8, "Mature active user should have high weight");
assert.equal(evalMature.isActive, true);

// Case B: Brand new account created 5 minutes ago with zero activity
const brandNewUser = {
	userId: "user-new",
	createdAt: new Date(Date.now() - 5 * 60 * 1000),
	hasAvatar: false,
	hasBio: false,
	downloadCount: 0,
	likeCount: 0,
	bookmarkCount: 0,
	presetCount: 0,
	followingCount: 1,
};
const evalNew = evaluateFollowerTrust(brandNewUser);
assert.ok(evalNew.weight < 0.3, "Brand new user should have low initial trust");
assert.equal(evalNew.isActive, false);

// Case C: Spam mass-follow bot
const spamBotUser = {
	userId: "user-bot",
	createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
	hasAvatar: false,
	hasBio: false,
	downloadCount: 0,
	likeCount: 0,
	bookmarkCount: 0,
	presetCount: 0,
	followingCount: 80, // mass-following
};
const evalBot = evaluateFollowerTrust(spamBotUser);
assert.equal(evalBot.weight, 0, "Mass-following bot must receive 0 weight");
assert.equal(evalBot.isActive, false);
console.log("✅ Passed: Active follower trust correctly distinguishes mature, new, and spam users.\n");

// 3. Test Deterministic Creator Reputation Scoring Formula
console.log("TEST 3: Creator Reputation Score Calculation");
const REPUTATION_CONFIG = {
	WEIGHT_UNIQUE_DOWNLOADS: 3.0,
	WEIGHT_QUALITY_LIKES: 2.0,
	WEIGHT_ACTIVE_FOLLOWERS: 0.5,
	AGE_BONUS_PER_30_DAYS: 0.1,
	MAX_AGE_BONUS: 10.0,
};

function calculateAccountAgeBonus(createdAt) {
	const created = new Date(createdAt);
	const now = new Date();
	const diffMs = Math.max(0, now.getTime() - created.getTime());
	const ageInDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const periodsOf30Days = ageInDays / 30;
	const bonus = Math.min(
		REPUTATION_CONFIG.MAX_AGE_BONUS,
		Number((periodsOf30Days * REPUTATION_CONFIG.AGE_BONUS_PER_30_DAYS).toFixed(2)),
	);
	return { ageInDays, bonus };
}

function calculateCreatorReputationScore(input) {
	const uniqueDownloads = Math.max(0, input.uniqueDownloads || 0);
	const qualityLikes = Math.max(0, input.qualityLikes || 0);
	const activeFollowers = Math.max(0, input.activeFollowers || 0);
	const suspiciousPenalty = Math.max(0, input.suspiciousActivityPenalty || 0);
	const { ageInDays, bonus: accountAgeBonus } = calculateAccountAgeBonus(input.createdAt);

	const uniqueDownloadsPoints = uniqueDownloads * REPUTATION_CONFIG.WEIGHT_UNIQUE_DOWNLOADS;
	const qualityLikesPoints = qualityLikes * REPUTATION_CONFIG.WEIGHT_QUALITY_LIKES;
	const activeFollowersPoints = activeFollowers * REPUTATION_CONFIG.WEIGHT_ACTIVE_FOLLOWERS;

	const rawScore =
		uniqueDownloadsPoints +
		qualityLikesPoints +
		activeFollowersPoints +
		accountAgeBonus -
		suspiciousPenalty;

	const totalScore = Math.max(0, Number(rawScore.toFixed(2)));
	return { totalScore, accountAgeBonus };
}

// Calculate score: 100 unique downloads (300pts) + 50 quality likes (100pts) + 20 active followers (10pts) + 60 days old (0.2pts)
const creatorScoreResult = calculateCreatorReputationScore({
	uniqueDownloads: 100,
	qualityLikes: 50,
	activeFollowers: 20,
	createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
	suspiciousActivityPenalty: 0,
});
// 100*3 + 50*2 + 20*0.5 + 0.2 = 300 + 100 + 10 + 0.2 = 410.2
assert.equal(creatorScoreResult.totalScore, 410.2);

// Test non-negative boundary
const penalizedResult = calculateCreatorReputationScore({
	uniqueDownloads: 1,
	qualityLikes: 0,
	activeFollowers: 0,
	createdAt: new Date(),
	suspiciousActivityPenalty: 500,
});
assert.equal(penalizedResult.totalScore, 0, "Reputation score must never be negative");
console.log("✅ Passed: Reputation scoring formula matches specification and enforces boundaries.\n");

// 4. Test Multi-Layer Deduplication Logic
console.log("TEST 4: Multi-Layer Unique Download Deduplication");
const downloadStore = [];

function recordDownloadSim(params) {
	const { presetId, userId, anonymousToken, ipHash, windowHours = 6 } = params;
	const windowMs = windowHours * 60 * 60 * 1000;
	const now = Date.now();

	let isDuplicate = false;
	if (userId) {
		isDuplicate = downloadStore.some(
			(d) => d.presetId === presetId && d.userId === userId && now - d.timestamp < windowMs,
		);
	} else if (anonymousToken) {
		isDuplicate = downloadStore.some(
			(d) => d.presetId === presetId && d.anonymousToken === anonymousToken && now - d.timestamp < windowMs,
		);
	} else if (ipHash) {
		isDuplicate = downloadStore.some(
			(d) => d.presetId === presetId && d.ipHash === ipHash && now - d.timestamp < windowMs,
		);
	}

	const isUnique = !isDuplicate;
	downloadStore.push({
		presetId,
		userId,
		anonymousToken,
		ipHash,
		timestamp: now,
		isUnique,
	});
	return isUnique;
}

// Step A: First download by user A -> UNIQUE
const d1 = recordDownloadSim({ presetId: "preset-1", userId: "user-A", ipHash: "ip-1" });
assert.equal(d1, true, "First download must be unique");

// Step B: Immediate second download by user A -> DUPLICATE
const d2 = recordDownloadSim({ presetId: "preset-1", userId: "user-A", ipHash: "ip-1" });
assert.equal(d2, false, "Repeat download within window must be duplicate");

// Step C: Different user B from same CGNAT IP -> UNIQUE (User ID takes priority over IP)
const d3 = recordDownloadSim({ presetId: "preset-1", userId: "user-B", ipHash: "ip-1" });
assert.equal(d3, true, "Different user on shared CGNAT IP must still count as unique");

// Step D: Guest with anonymous token -> UNIQUE
const d4 = recordDownloadSim({ presetId: "preset-1", anonymousToken: "token-guest-1", ipHash: "ip-1" });
assert.equal(d4, true, "New anonymous token must be unique");

// Step E: Same guest repeating -> DUPLICATE
const d5 = recordDownloadSim({ presetId: "preset-1", anonymousToken: "token-guest-1", ipHash: "ip-1" });
assert.equal(d5, false, "Same anonymous token repeating must be duplicate");

console.log("✅ Passed: Multi-layer deduplication handles users, tokens, and CGNAT IPs perfectly.\n");

// 5. Test Monetization 90:10 Revenue Split Calculation
console.log("TEST 5: Monetization 90:10 Net Revenue Split");
function calculatePresetPayout(grossAmount, provider = "qris") {
	if (grossAmount <= 0) {
		return { gross: 0, processorFee: 0, net: 0, creatorPayout: 0, platformFee: 0 };
	}
	// QRIS fee = 0.7%
	const processorFee = Number((grossAmount * 0.007).toFixed(2));
	const net = Number((grossAmount - processorFee).toFixed(2));
	const creatorPayout = Number((net * 0.9).toFixed(2));
	const platformFee = Number((net - creatorPayout).toFixed(2));
	return { gross: grossAmount, processorFee, net, creatorPayout, platformFee };
}

// Example: Preset Rp 10.000
const payout10k = calculatePresetPayout(10000, "qris");
assert.equal(payout10k.gross, 10000);
assert.equal(payout10k.processorFee, 70); // 0.7% of 10000 = 70
assert.equal(payout10k.net, 9930); // 10000 - 70 = 9930
assert.equal(payout10k.creatorPayout, 8937); // 90% of 9930 = 8937
assert.equal(payout10k.platformFee, 993); // 10% of 9930 = 993
assert.equal(payout10k.creatorPayout + payout10k.platformFee, payout10k.net, "Sum of payouts must equal exact net amount");

// Example: Free Preset (Rp 0)
const payoutFree = calculatePresetPayout(0);
assert.equal(payoutFree.gross, 0);
assert.equal(payoutFree.creatorPayout, 0);
assert.equal(payoutFree.platformFee, 0);

console.log("✅ Passed: 90:10 Monetization split correctly calculates processor fees and payouts.\n");

console.log("==================================================");
console.log("ALL AMHUB ARCHITECTURE TEST CASES PASSED SUCCESSFULLY!");
console.log("==================================================");
