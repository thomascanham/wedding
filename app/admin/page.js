import { Button } from "@mantine/core";
import { Logout } from "@/actions/authActions";

export default function AdminDashboard() {
  return (
    <>
      <h1>Admin Page</h1>
      <form action={Logout}>
        <Button type="submit">Log Out</Button>
      </form>
    </>
  )
}