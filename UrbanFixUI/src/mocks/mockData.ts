import type {
  Assignment,
  Notification,
  Report,
  TechnicalTeam,
  TimelineEntry,
  Verification,
} from '../types/report'

export const mockReports: Report[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    submitterEmail: 'anna.nowak@example.com',
    fileName: 'rynek-kostka.jpg',
    fileExtension: '.jpg',
    description:
      'Zapadnięta kostka brukowa przy przejściu przez Rynek. Miejsce jest niebezpieczne dla pieszych.',
    latitude: 51.109,
    longitude: 17.0327,
    fileSize: 842315,
    uploadedAt: '2026-06-05T08:24:00Z',
    s3ObjectKey: 'reports/11111111-1111-4111-8111-111111111111.jpg',
    status: 'New',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    submitterEmail: 'marek.kowalski@example.com',
    fileName: 'plac-grunwaldzki-kosz.jpg',
    fileExtension: '.jpg',
    description:
      'Przepełniony kosz przy przystanku na Placu Grunwaldzkim. Odpady leżą obok i blokują przejście.',
    latitude: 51.1118,
    longitude: 17.0601,
    fileSize: 531204,
    uploadedAt: '2026-06-04T15:10:00Z',
    s3ObjectKey: 'reports/22222222-2222-4222-8222-222222222222.jpg',
    status: 'Assigned',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    submitterEmail: 'ewa.wisniewska@example.com',
    fileName: 'legnicka-latarnia.jpg',
    fileExtension: '.jpg',
    description:
      'Latarnia przy ulicy Legnickiej nie świeci po zmroku, szczególnie przy przejściu dla pieszych.',
    latitude: 51.1192,
    longitude: 16.9896,
    fileSize: 612778,
    uploadedAt: '2026-06-03T19:42:00Z',
    s3ObjectKey: 'reports/33333333-3333-4333-8333-333333333333.jpg',
    status: 'Assigned',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    submitterEmail: 'jan.zielinski@example.com',
    fileName: 'park-szczytnicki-galaz.jpg',
    fileExtension: '.jpg',
    description:
      'Złamana gałąź w Parku Szczytnickim wisi nisko nad alejką i może spaść przy silniejszym wietrze.',
    latitude: 51.1172,
    longitude: 17.0795,
    fileSize: 925440,
    uploadedAt: '2026-06-05T06:05:00Z',
    s3ObjectKey: 'reports/44444444-4444-4444-8444-444444444444.jpg',
    status: 'Verified',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    submitterEmail: 'ola.mazur@example.com',
    fileName: 'dworzec-oznakowanie.jpg',
    fileExtension: '.jpg',
    description:
      'Odnowiono oznakowanie poziome przy przejściu dla pieszych obok Dworca Głównego.',
    latitude: 51.0982,
    longitude: 17.0367,
    fileSize: 477109,
    uploadedAt: '2026-06-01T12:00:00Z',
    s3ObjectKey: 'reports/55555555-5555-4555-8555-555555555555.jpg',
    status: 'Completed',
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    submitterEmail: 'piotr.lis@example.com',
    fileName: 'nadodrze-zgloszenie.jpg',
    fileExtension: '.jpg',
    description:
      'Zgłoszenie z Nadodrza odrzucone po weryfikacji z powodu braku widocznej usterki.',
    latitude: 51.1199,
    longitude: 17.0338,
    fileSize: 394020,
    uploadedAt: '2026-06-02T09:15:00Z',
    s3ObjectKey: 'reports/66666666-6666-4666-8666-666666666666.jpg',
    status: 'Rejected',
  },
]

export const mockTeams: TechnicalTeam[] = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'Czysty Wrocław',
    isAvailable: false,
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    name: 'Oświetlenie Miejskie',
    isAvailable: false,
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    name: 'Zieleń i Parki',
    isAvailable: true,
  },
]

export const mockAssignments: Assignment[] = [
  {
    assignmentId: '77777777-7777-4777-8777-777777777777',
    reportId: '22222222-2222-4222-8222-222222222222',
    assignedTeamId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    teamName: 'Czysty Wrocław',
    teamAvailable: false,
    status: 'New',
  },
  {
    assignmentId: '88888888-8888-4888-8888-888888888888',
    reportId: '33333333-3333-4333-8333-333333333333',
    assignedTeamId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    teamName: 'Oświetlenie Miejskie',
    teamAvailable: false,
    status: 'InProgress',
  },
  {
    assignmentId: '99999999-9999-4999-8999-999999999999',
    reportId: '55555555-5555-4555-8555-555555555555',
    assignedTeamId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    teamName: 'Zieleń i Parki',
    teamAvailable: true,
    status: 'Completed',
  },
]

export const mockVerifications: Verification[] = [
  {
    verificationId: '12121212-1212-4121-8121-121212121212',
    reportId: '11111111-1111-4111-8111-111111111111',
    submitterEmail: 'anna.nowak@example.com',
    officeWorkerId: 'Admin_01',
    decision: 'Pending',
    comment: null,
    verifiedAt: '2026-06-05T08:30:00Z',
  },
  {
    verificationId: '23232323-2323-4232-8232-232323232323',
    reportId: '44444444-4444-4444-8444-444444444444',
    submitterEmail: 'jan.zielinski@example.com',
    officeWorkerId: 'Admin_01',
    decision: 'Accepted',
    comment: 'Zgłoszenie zasadne, przekazano do obsługi.',
    verifiedAt: '2026-06-05T06:58:00Z',
  },
  {
    verificationId: '34343434-3434-4343-8343-343434343434',
    reportId: '66666666-6666-4666-8666-666666666666',
    submitterEmail: 'piotr.lis@example.com',
    officeWorkerId: 'Admin_01',
    decision: 'Rejected',
    comment: 'Brak widocznego problemu na załączonym zdjęciu.',
    verifiedAt: '2026-06-02T10:00:00Z',
  },
]

export const mockTimelines: TimelineEntry[] = [
  {
    id: '45454545-4545-4454-8454-454545454545',
    reportId: '22222222-2222-4222-8222-222222222222',
    newStatus: 'New',
    description: 'Utworzono przypisanie zadania dla zespołu Czysty Wrocław.',
    occurredAt: '2026-06-05T07:30:00Z',
  },
  {
    id: '56565656-5656-4565-8565-565656565656',
    reportId: '33333333-3333-4333-8333-333333333333',
    newStatus: 'InProgress',
    description: 'Ekipa rozpoczęła realizację przy ulicy Legnickiej.',
    occurredAt: '2026-06-05T09:15:00Z',
  },
  {
    id: '67676767-6767-4676-8676-676767676767',
    reportId: '55555555-5555-4555-8555-555555555555',
    newStatus: 'Completed',
    description: 'Zadanie przy Dworcu Głównym zakończone.',
    occurredAt: '2026-06-04T14:20:00Z',
  },
]

export const mockNotifications: Notification[] = [
  {
    id: '78787878-7878-4787-8787-787878787878',
    reportId: '22222222-2222-4222-8222-222222222222',
    recipientEmail: 'marek.kowalski@example.com',
    messageBody: 'Zgłoszenie zostało przypisane do ekipy technicznej.',
    sentAt: '2026-06-05T07:31:00Z',
  },
  {
    id: '89898989-8989-4898-8898-898989898989',
    reportId: '55555555-5555-4555-8555-555555555555',
    recipientEmail: 'ola.mazur@example.com',
    messageBody: 'Zgłoszenie zostało zakończone.',
    sentAt: '2026-06-04T14:21:00Z',
  },
]
