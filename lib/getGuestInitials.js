export default function getGuestInitials(firstname, surname) {
  const initOne = firstname[0].toUpperCase();
  const initTwo = surname[0].toUpperCase();

  return `${initOne}${initTwo}`
}