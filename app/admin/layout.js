import { Container } from "@mantine/core";
import Navbar from "@/components/admin/layout/Navbar";

export default function AdminLayout({ children }) {
  return (
    <>
      <Navbar />
      <Container>
        {children}
      </Container>
    </>
  )
}