"use client";

import { AuthModal } from "@/app/_components/AuthModal";
import type { User } from "@presethub/types";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
	currentUser: User | null;
	requireAuth: (action?: () => void, title?: string) => boolean;
	openAuthModal: (title?: string) => void;
	closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
	currentUser: null,
	requireAuth: () => false,
	openAuthModal: () => {},
	closeAuthModal: () => {},
});

export function AuthProvider({
	currentUser,
	children,
}: {
	currentUser: User | null;
	children: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);

	const requireAuth = (action?: () => void, title?: string) => {
		if (currentUser) {
			if (action) action();
			return true;
		}
		if (title) setModalTitle(title);
		setIsOpen(true);
		return false;
	};

	const openAuthModal = (title?: string) => {
		if (title) setModalTitle(title);
		setIsOpen(true);
	};

	const closeAuthModal = () => {
		setIsOpen(false);
		setModalTitle(undefined);
	};

	useEffect(() => {
		const handleAuthRequired = (e: Event) => {
			const customEvent = e as CustomEvent<{ title?: string }>;
			openAuthModal(customEvent.detail?.title);
		};
		window.addEventListener("auth:required", handleAuthRequired);
		return () => {
			window.removeEventListener("auth:required", handleAuthRequired);
		};
	}, []);

	return (
		<AuthContext.Provider
			value={{ currentUser, requireAuth, openAuthModal, closeAuthModal }}
		>
			{children}
			<AuthModal
				isOpen={isOpen}
				onClose={closeAuthModal}
				actionTitle={modalTitle}
			/>
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
