import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React from "react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const updateInterviewStatus = useMutation(
    api.interviews.updateInterviewStatus
  );
  const interview = useQuery(api.interviews.getInterviewByStreamCallId, {
    streamCallId: call?.id || "",
  });
  if (!call || !interview) return null;

  const isMeetingOwner = call.state.createdBy?.id === localParticipant?.userId;
  if (!isMeetingOwner) return null;

  const endCall = async () => {
    try {
      await call.endCall();
      await updateInterviewStatus({
        id: interview._id,
        status: "completed",
      });
      router.push("/");
      toast.success("Meeting ended for everyone");
    } catch (e) {
      console.error(e);
      toast.error("Failed to end meeting");
    }
  };
  return (
    <Button variant={"destructive"} onClick={endCall}>
      End meeting
    </Button>
  );
};

export default EndCallButton;
