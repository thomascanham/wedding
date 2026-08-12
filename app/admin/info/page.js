import { Paper, Title, Stack, Text, Divider, SimpleGrid, Card, Group, ThemeIcon } from "@mantine/core";
import { IconMusic, IconMicrophone2, IconMicrophone, IconCake, IconUsers, IconUsersGroup, IconTie, IconSpeakerphone, IconGlassCocktail, IconChefHat, IconPlaylist, IconChecklist, IconWalk, IconToolsKitchen2, IconHeadphones, IconCandy, IconCup, IconAddressBook } from "@tabler/icons-react";
import {
  fetchWeddingInfo,
  fetchDjSetlists,
  createDjSetlist,
  toggleDjSetlistSubmitted,
  deleteDjSetlist,
  fetchBridalParty,
  createBridalPartyEntry,
  updateBridalPartyEntry,
  deleteBridalPartyEntry,
  fetchGroomsmen,
  createGroomsmanEntry,
  updateGroomsmanEntry,
  deleteGroomsmanEntry,
  fetchAisleWalkOrder,
  createAisleWalkOrderEntry,
  updateAisleWalkOrderEntry,
  moveAisleWalkOrderEntry,
  deleteAisleWalkOrderEntry,
  fetchSpeechOrder,
  createSpeechOrderEntry,
  updateSpeechOrderEntry,
  moveSpeechOrderEntry,
  deleteSpeechOrderEntry,
  fetchCanapes,
  createCanapeEntry,
  updateCanapeEntry,
  deleteCanapeEntry,
  fetchDaytimeChecklist,
  createDaytimeChecklistItem,
  toggleDaytimeChecklistItem,
  deleteDaytimeChecklistItem,
  fetchSuppliers,
  createSupplierEntry,
  updateSupplierEntry,
  deleteSupplierEntry,
} from "@/actions/infoActions";
import { fetchAllGuests } from "@/actions/guestActions";
import InfoSection from "@/components/admin/info/InfoSection";
import ChecklistManager from "@/components/admin/info/ChecklistManager";
import PersonListManager from "@/components/admin/info/PersonListManager";
import OrderedListManager from "@/components/admin/info/OrderedListManager";

export const dynamic = 'force-dynamic';

const MC_FIELDS = [
  { key: 'masterOfCeremonies', label: 'Name', placeholder: 'e.g., John Smith' },
];

const CEREMONY_MUSICIAN_FIELDS = [
  { key: 'ceremonyMusicGuest', label: 'Name', placeholder: 'e.g., John Smith' },
];

const MUSIC_FIELDS = [
  { key: 'aisleWalkSong', label: 'Aisle Walk Song', placeholder: 'e.g., Canon in D' },
  { key: 'signingSong', label: 'Signing Song', placeholder: 'e.g., A Thousand Years' },
  { key: 'exitSong', label: 'Exit Song', placeholder: 'e.g., Marry You' },
];

const WELCOME_DRINKS_FIELDS = [
  { key: 'welcomeDrinksCount', label: 'Welcome Drinks', placeholder: 'e.g., 60' },
  { key: 'nonAlcoholicWelcomeDrinksCount', label: 'Non-Alcoholic Welcome Drinks', placeholder: 'e.g., 15' },
];

const TOASTING_DRINKS_FIELDS = [
  { key: 'toastingDrinksCount', label: 'Toasting Drinks', placeholder: 'e.g., 60' },
  { key: 'nonAlcoholicToastingDrinksCount', label: 'Non-Alcoholic Toasting Drinks', placeholder: 'e.g., 15' },
];

const CAKE_FIELDS = [
  { key: 'cakeCut', label: 'Cake Cut', placeholder: 'e.g., Yes, after speeches' },
  { key: 'cakeBigFlavour', label: 'Big Flavour', placeholder: 'e.g., Chocolate Fudge' },
  { key: 'cakeMediumFlavour', label: 'Medium Flavour', placeholder: 'e.g., Lemon Drizzle' },
  { key: 'cakeSmallFlavour', label: 'Small Flavour', placeholder: 'e.g., Victoria Sponge' },
  { key: 'cakeAmountSaved', label: 'Amount Saved', placeholder: 'e.g., One tier for anniversary' },
];

const SWEET_CART_FIELDS = [
  { key: 'sweetCart', label: 'Sweet Cart', placeholder: 'e.g., Yes' },
];

const BARISTAS_FIELDS = [
  { key: 'baristas', label: 'Baristas', placeholder: 'e.g., Yes' },
];

const EVENING_ENTERTAINMENT_FIELDS = [
  { key: 'firstDanceSong', label: 'First Dance Song', placeholder: 'e.g., Perfect' },
];

const DJ_FIELDS = [
  { key: 'djName', label: 'DJ Name', placeholder: 'e.g., John Smith' },
  { key: 'djArrivalTime', label: 'Arrival Time (Set Up)', placeholder: 'e.g., 4:00pm' },
  { key: 'djStartTime', label: 'Start Time', placeholder: 'e.g., 7:00pm' },
  { key: 'boothMeasurements', label: 'Booth Size', placeholder: 'e.g., 2m x 2m' },
  { key: 'djContractProvided', label: 'Contract Provided', type: 'checkbox' },
];

const PARTY_FIELDS = [
  { key: 'role', label: 'Role', placeholder: 'e.g., Maid of Honor' },
  { key: 'breakfastChoice', label: 'Breakfast Choice', placeholder: 'e.g., Full English' },
];

const SUPPLIER_FIELDS = [
  { key: 'role', label: 'Profession / Role', placeholder: 'e.g., Florist' },
  { key: 'contactInfo', label: 'Contact Information', placeholder: 'e.g., 07700 900123' },
];

const sectionLabelStyles = { letterSpacing: '0.06em' };

function GuestCountTile({ label, count, subtitle = 'confirmed attending', icon = <IconUsers size={16} /> }) {
  return (
    <Card withBorder shadow="sm" radius="md" p="lg" style={{ borderColor: 'var(--custom-theme-fill)' }}>
      <Group justify="space-between" align="flex-start" mb="xs">
        <Text fz="sm" fw={500} c="dimmed" ff="text">{label}</Text>
        <ThemeIcon variant="light" size="md" radius="md" color="var(--custom-theme-heading)">
          {icon}
        </ThemeIcon>
      </Group>
      <Text fz={36} fw={700} ff="heading" lh={1} c="var(--custom-theme-heading)">{count}</Text>
      <Text fz="xs" c="dimmed" ff="text" mt={4}>{subtitle}</Text>
    </Card>
  );
}

function InfoPageSection({ title, children }) {
  return (
    <Stack gap="md">
      <div>
        <Text fz="xs" fw={700} tt="uppercase" ff="heading" c="var(--custom-theme-heading)" style={sectionLabelStyles}>
          {title}
        </Text>
        <Divider mt="xs" color="var(--custom-theme-fill)" />
      </div>
      <Stack gap="xl">
        {children}
      </Stack>
    </Stack>
  );
}

export default async function AdminInfo() {
  const { data: info } = await fetchWeddingInfo();
  const { data: djSetlists } = await fetchDjSetlists();
  const { data: bridalParty } = await fetchBridalParty();
  const { data: groomsmen } = await fetchGroomsmen();
  const { data: aisleWalkOrder } = await fetchAisleWalkOrder();
  const { data: speechOrder } = await fetchSpeechOrder();
  const { data: canapes } = await fetchCanapes();
  const { data: daytimeChecklist } = await fetchDaytimeChecklist();
  const { data: suppliers } = await fetchSuppliers();
  const { data: guestsRaw } = await fetchAllGuests();
  const guests = Array.isArray(guestsRaw) ? guestsRaw : [];

  const ceremonyAttending = guests.filter((g) => g.attendanceType === 'ceremony' && g.rsvpStatus === 'attending').length;
  const receptionAttending = guests.filter((g) => g.attendanceType === 'reception' && g.rsvpStatus === 'attending').length;
  const hogRoastCount = guests.filter((g) => g.eveningMeal === 'Hog Roast').length;
  const vegetarianCount = guests.filter((g) => g.eveningMeal === 'Vegetarian / Vegan').length;

  return (
    <Paper py="xl" bg="transparent">
      <Title c="var(--custom-theme-heading)" ff="heading" mb="xl">Info</Title>
      <Stack gap={48}>
        <InfoPageSection title="Guest Counts">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <GuestCountTile label="Ceremony" count={ceremonyAttending} />
            <GuestCountTile label="Reception" count={receptionAttending} />
          </SimpleGrid>
          <PersonListManager
            title="Bridal Party"
            icon={<IconUsersGroup size={16} color="var(--custom-theme-heading)" />}
            note="Breakfast choice needed 2 weeks before the wedding"
            initialData={bridalParty}
            createAction={createBridalPartyEntry}
            updateAction={updateBridalPartyEntry}
            deleteAction={deleteBridalPartyEntry}
            primaryLabel="Name"
            fields={PARTY_FIELDS}
            emptyText="No bridal party members added yet."
          />
          <PersonListManager
            title="Groomsmen"
            icon={<IconTie size={16} color="var(--custom-theme-heading)" />}
            note="Breakfast choice needed 2 weeks before the wedding"
            initialData={groomsmen}
            createAction={createGroomsmanEntry}
            updateAction={updateGroomsmanEntry}
            deleteAction={deleteGroomsmanEntry}
            primaryLabel="Name"
            fields={PARTY_FIELDS}
            emptyText="No groomsmen added yet."
          />
        </InfoPageSection>

        <InfoPageSection title="Ceremony">
          <InfoSection
            title="Master of Ceremonies"
            icon={<IconSpeakerphone size={16} color="var(--custom-theme-heading)" />}
            note="Name of the guest acting as Master of Ceremonies"
            fields={MC_FIELDS}
            initialData={info}
          />
          <InfoSection
            title="Ceremony Music"
            icon={<IconMusic size={16} color="var(--custom-theme-heading)" />}
            note="Name of the guest responsible for playing music during the ceremony"
            fields={CEREMONY_MUSICIAN_FIELDS}
            initialData={info}
          />
          <InfoSection
            title="Music"
            icon={<IconMusic size={16} color="var(--custom-theme-heading)" />}
            fields={MUSIC_FIELDS}
            initialData={info}
          />
          <OrderedListManager
            title="Aisle Walk Order"
            icon={<IconWalk size={16} color="var(--custom-theme-heading)" />}
            note="Order the bridal party will walk down the aisle"
            initialData={aisleWalkOrder}
            createAction={createAisleWalkOrderEntry}
            updateAction={updateAisleWalkOrderEntry}
            moveAction={moveAisleWalkOrderEntry}
            deleteAction={deleteAisleWalkOrderEntry}
            emptyText="No names added yet."
          />
        </InfoPageSection>

        <InfoPageSection title="Daytime">
          <InfoSection
            title="Welcome Drinks"
            icon={<IconGlassCocktail size={16} color="var(--custom-theme-heading)" />}
            note="Amount of welcome drinks required, including non-alcoholic"
            fields={WELCOME_DRINKS_FIELDS}
            initialData={info}
          />
          <InfoSection
            title="Toasting Drinks"
            icon={<IconGlassCocktail size={16} color="var(--custom-theme-heading)" />}
            note="Amount of toasting drinks required, including non-alcoholic"
            fields={TOASTING_DRINKS_FIELDS}
            initialData={info}
          />
          <PersonListManager
            title="Our Choice Of Canapés"
            icon={<IconChefHat size={16} color="var(--custom-theme-heading)" />}
            initialData={canapes}
            createAction={createCanapeEntry}
            updateAction={updateCanapeEntry}
            deleteAction={deleteCanapeEntry}
            primaryLabel="Canapé"
            primaryPlaceholder="e.g., Mini Yorkshire Puddings"
            fields={[]}
            emptyText="No canapés added yet."
          />
          <ChecklistManager
            title="Daytime Checklist"
            icon={<IconChecklist size={16} color="var(--custom-theme-heading)" />}
            initialData={daytimeChecklist}
            createAction={createDaytimeChecklistItem}
            toggleAction={toggleDaytimeChecklistItem}
            deleteAction={deleteDaytimeChecklistItem}
            valueKey="completed"
            itemLabel="Task"
            itemPlaceholder="e.g., Confirm table plan with venue"
            checkboxLabel="Done"
            emptyText="No to-dos added yet."
          />
          <OrderedListManager
            title="Order of Speeches"
            icon={<IconMicrophone size={16} color="var(--custom-theme-heading)" />}
            note="Order the speeches will be given, and by whom"
            initialData={speechOrder}
            createAction={createSpeechOrderEntry}
            updateAction={updateSpeechOrderEntry}
            moveAction={moveSpeechOrderEntry}
            deleteAction={deleteSpeechOrderEntry}
            emptyText="No speeches added yet."
          />
        </InfoPageSection>

        <InfoPageSection title="Evening">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <GuestCountTile
              label="Hog Roast"
              count={hogRoastCount}
              subtitle="guests chosen"
              icon={<IconToolsKitchen2 size={16} />}
            />
            <GuestCountTile
              label="Vegetarian / Vegan"
              count={vegetarianCount}
              subtitle="guests chosen"
              icon={<IconToolsKitchen2 size={16} />}
            />
          </SimpleGrid>
          <InfoSection
            title="Evening Entertainment"
            icon={<IconMicrophone2 size={16} color="var(--custom-theme-heading)" />}
            fields={EVENING_ENTERTAINMENT_FIELDS}
            initialData={info}
          />
          <InfoSection
            title="DJ"
            icon={<IconHeadphones size={16} color="var(--custom-theme-heading)" />}
            fields={DJ_FIELDS}
            initialData={info}
          />
          <InfoSection
            title="Cake"
            icon={<IconCake size={16} color="var(--custom-theme-heading)" />}
            fields={CAKE_FIELDS}
            initialData={info}
          />
          <InfoSection
            title="Sweet Cart"
            icon={<IconCandy size={16} color="var(--custom-theme-heading)" />}
            fields={SWEET_CART_FIELDS}
            initialData={info}
          />
          <InfoSection
            title="Baristas"
            icon={<IconCup size={16} color="var(--custom-theme-heading)" />}
            fields={BARISTAS_FIELDS}
            initialData={info}
          />
          <ChecklistManager
            title="DJ Setlists"
            icon={<IconPlaylist size={16} color="var(--custom-theme-heading)" />}
            initialData={djSetlists}
            createAction={createDjSetlist}
            toggleAction={toggleDjSetlistSubmitted}
            deleteAction={deleteDjSetlist}
            valueKey="submitted"
            itemLabel="Guest Name"
            itemPlaceholder="e.g., John Smith"
            checkboxLabel="Setlist handed in"
            emptyText="No guest DJs added yet."
          />
        </InfoPageSection>

        <InfoPageSection title="Suppliers">
          <PersonListManager
            title="Suppliers"
            icon={<IconAddressBook size={16} color="var(--custom-theme-heading)" />}
            initialData={suppliers}
            createAction={createSupplierEntry}
            updateAction={updateSupplierEntry}
            deleteAction={deleteSupplierEntry}
            primaryLabel="Name"
            fields={SUPPLIER_FIELDS}
            emptyText="No suppliers added yet."
          />
        </InfoPageSection>
      </Stack>
    </Paper>
  );
}
