import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="flex flex-col">
      <div className="mt-12 flex flex-col items-center p-4">
        <p className="text-cenåter text-4xl font-bold">
          Welcome to <span className="font-bold">LUIM</span>{" "}
          <span className="font-bold">AI</span>
        </p>
        <p>The only AI for your business</p>
      </div>
      <div className="mt-0 flex justify-center gap-4">
        <Button className="flex items-center gap-2">Get Started</Button>
        <Button variant="secondary" className="flex items-center gap-2">
          Learn More
        </Button>
      </div>
    </div>
  );
}
