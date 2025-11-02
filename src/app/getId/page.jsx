"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../utils/checkAuth"; // your auth hook

const Page = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // agar user mil gaya to uska id set kar do
        if (user) {
          console.log("User ID:", user.id);
          setUserId(user.id);
        } else {
          console.log("No user found");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, [user]); // user change hoga to ye effect dobara chalega

  return (
    <div>
      Hello {userId ? `User ID: ${userId}` : "Loading..."}
    </div>
  );
};

export default Page;
