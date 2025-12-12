import { Button } from "@mantine/core";
import { Logout } from "@/actions/authActions";


export default function LogoutButton() {
  return (
    <form action={Logout}>
      <Button
        type="submit"
        size="xs"
        variant="filled"
        color="var(--custom-theme-heading)"
        ff="text"
      >
        Log Out
      </Button>
    </form>
  )
}