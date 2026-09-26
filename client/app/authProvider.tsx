"use client";

import React, { useEffect, useRef } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
    },
  },
});

const formFields = {
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      inputProps: { required: true },
    },
    email: {
      order: 2,
      placeholder: "Enter your email address",
      label: "Email",
      inputProps: { type: "email", required: true },
    },
    password: {
      order: 3,
      placeholder: "Enter your password",
      label: "Password",
      inputProps: { type: "password", required: true },
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      inputProps: { type: "password", required: true },
    },
  },
};

const ProvisionUser = ({ children }: { children: React.ReactNode }) => {
  const provisioningRef = useRef(false);
  useEffect(() => {
    const provisionUser = async () => {
          if (provisioningRef.current) {
      return;
    }

    provisioningRef.current = true;
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();

        const accessToken = session.tokens?.accessToken?.toString();

	if (!accessToken) {
	  console.error("No Cognito access token available");
	  return;
	}

	let appSessionId = sessionStorage.getItem("appSessionId");

	if (!appSessionId) {
	  appSessionId = crypto.randomUUID();
	  sessionStorage.setItem("appSessionId", appSessionId);
	}

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
            body: JSON.stringify({
              username: user.username,
              cognitoId: user.userId,
              profilePictureUrl: "i1.jpg",
              teamId: 1,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("Failed to provision RDS user:", error);
          return;
        }

        const data = await response.json();
        console.log("RDS user provisioned:", data);
	const sessionResponse = await fetch(
	  `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/session`,
	  {
	    method: "POST",
	    headers: {
	      "Content-Type": "application/json",
	      Authorization: `Bearer ${accessToken}`,
	      "x-session-id": appSessionId,
	    },
	  }
	);

	if (sessionResponse.status === 409) {
  const conflict = await sessionResponse.json();

  if (conflict.code === "SESSION_CONFLICT") {
    const shouldReplace = window.confirm(
      "This account is already signed in on another browser or device.\n\n" +
        "Continuing will sign out the other session.\n\n" +
        "Do you want to continue?"
    );

    if (!shouldReplace) {
      console.log("Session replacement cancelled");

      sessionStorage.removeItem("appSessionId");

      const { signOut } = await import("aws-amplify/auth");
      await signOut();

      window.location.href = "/";
      return;
    }

    const replaceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/session/replace`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "x-session-id": appSessionId,
        },
      }
    );

    if (!replaceResponse.ok) {
      const error = await replaceResponse.text();
      console.error("Failed to replace application session:", error);
      return;
    }

    console.log("Previous application session replaced");
    return;
  }
}

if (!sessionResponse.ok) {
  const error = await sessionResponse.text();
  console.error("Failed to register application session:", error);
  return;
}

console.log("Application session registered");
      } catch (error) {
        console.error("Error provisioning RDS user:", error);
      }
    };

    provisionUser();
  }, []);

  return <>{children}</>;
};

const AuthProvider = ({ children }: any) => {
  return (
    <div>
      <Authenticator formFields={formFields}>
        {({ user }: any) =>
          user ? (
            <ProvisionUser>{children}</ProvisionUser>
          ) : (
            <div>
              <h1>Please sign in below:</h1>
            </div>
          )
        }
      </Authenticator>
    </div>
  );
};

export default AuthProvider;
