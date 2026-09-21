"use client";

import Header from "@/components/Header";
import {
  useGetAuthUserQuery,
  useUpdateUserMutation,
} from "@/state/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { User } from "lucide-react";

const Settings = () => {
  const {
    data: currentUser,
    isLoading,
    isError,
    refetch,
  } = useGetAuthUserQuery({});

  const [updateUser, { isLoading: isUpdating }] =
    useUpdateUserMutation();

  const userDetails = currentUser?.userDetails;

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userDetails) {
      setUsername(userDetails.username || "");
      setProfilePictureUrl(userDetails.profilePictureUrl || "");
    }
  }, [userDetails]);

  const handleCancel = () => {
    setUsername(userDetails?.username || "");
    setProfilePictureUrl(userDetails?.profilePictureUrl || "");
    setMessage("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!userDetails?.cognitoId) {
      setMessage("Unable to identify the current user.");
      return;
    }

    if (!username.trim()) {
      setMessage("Username is required.");
      return;
    }

    try {
      await updateUser({
        cognitoId: userDetails.cognitoId,
        username: username.trim(),
        profilePictureUrl: profilePictureUrl.trim(),
      }).unwrap();

      await refetch();

      setMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (error: any) {
      setMessage(
        error?.data?.message ||
          error?.message ||
          "Unable to update profile."
      );
    }
  };

  const labelStyles =
    "block text-sm font-medium text-gray-700 dark:text-gray-200";

  const displayStyles =
    "mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  const inputStyles =
    "mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  if (isLoading) {
    return (
      <div className="p-8">
        <Header name="Settings" />
        <p className="mt-4 dark:text-white">Loading profile...</p>
      </div>
    );
  }

  if (isError || !userDetails) {
    return (
      <div className="p-8">
        <Header name="Settings" />
        <p className="mt-4 text-red-500">
          Unable to load profile.
        </p>
      </div>
    );
  }

  const profileImageUrl =
    profilePictureUrl && process.env.NEXT_PUBLIC_S3_BUCKET_URL
      ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${profilePictureUrl}`
      : null;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <Header name="Settings" />

        {!isEditing && (
          <button
            onClick={() => {
              setMessage("");
              setIsEditing(true);
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={username || "Profile picture"}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-gray-500" />
            )}
          </div>

          <div>
            <p className="font-semibold dark:text-white">
              {userDetails.username}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              User ID: {userDetails.userId}
            </p>
          </div>
        </div>

        <div>
          <label className={labelStyles}>Username</label>

          {isEditing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputStyles}
            />
          ) : (
            <div className={displayStyles}>
              {userDetails.username}
            </div>
          )}
        </div>

        <div>
          <label className={labelStyles}>Profile Picture</label>

          {isEditing ? (
            <input
              type="text"
              value={profilePictureUrl}
              onChange={(e) =>
                setProfilePictureUrl(e.target.value)
              }
              placeholder="Example: p8.jpg"
              className={inputStyles}
            />
          ) : (
            <div className={displayStyles}>
              {userDetails.profilePictureUrl || "No profile picture"}
            </div>
          )}
        </div>

        <div>
          <label className={labelStyles}>Team ID</label>
          <div className={displayStyles}>
            {userDetails.teamId ?? "No team assigned"}
          </div>
        </div>

        {message && (
          <p
            className={
              message === "Profile updated successfully."
                ? "text-sm text-green-600"
                : "text-sm text-red-500"
            }
          >
            {message}
          </p>
        )}

        {isEditing && (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;