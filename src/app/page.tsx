import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="m-10">
      <SignInButton>
        <Button>Click here to sign in with clerk.</Button>
      </SignInButton>
    </div>
  );
}
