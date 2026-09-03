# Arhitectura Aplicatiei QR Feedback

## Scop

Aplicatia are doua experiente separate:

1. **Dashboard admin** - personalul vede mesele, scanarile, raspunsurile, ratingul si detaliile pe masa.
2. **Formular public QR** - clientul scaneaza QR-ul mesei, completeaza feedbackul si ajunge pe un screen separat de succes.

Codul actual este un prototip UI in Next.js App Router. Urmatorul pas corect este separarea lui pe rute, componente si layer de date, ca sa nu ramana toata logica in `page.tsx`.

## Principii

- Paginile Next raman **Server Components** by default.
- Folosim **Client Components** doar unde avem interactiune: selectare masa, drawer-uri, formular, rating buttons.
- Datele si tipurile nu stau in componente UI. Ele se muta in `lib/` si pot fi inlocuite mai tarziu cu DB/API fara refactor mare.
- Success screen-ul pentru feedback trebuie sa fie o stare/ruta separata, nu doar un mesaj ascuns in acelasi card.
- Design tokens importante, precum rosu Paradis, fundal crem, border auriu si radius 8px, trebuie centralizate ca sa nu copiem hex-uri peste tot.

## Structura recomandata

```txt
app/
  layout.tsx
  globals.css

  (admin)/
    page.tsx
    tables/
      [tableId]/
        page.tsx

  (public)/
    feedback/
      [qrToken]/
        page.tsx
        success/
          page.tsx

  actions/
    feedback.ts

components/
  admin/
    AdminDashboard.tsx
    TableGrid.tsx
    TableCard.tsx
    TableDrawer.tsx
    QuestionsDrawer.tsx
    ResponseRow.tsx

  feedback/
    FeedbackShell.tsx
    FeedbackForm.tsx
    RatingScale.tsx
    ServiceOptions.tsx
    NpsScale.tsx
    SuccessScreen.tsx

  ui/
    Button.tsx
    Card.tsx
    Drawer.tsx
    Metric.tsx

lib/
  feedback/
    types.ts
    mock-data.ts
    queries.ts
    mutations.ts
    validators.ts

public/
  qr-masa-12.png
```

## Rute

### Admin

`/`

- Dashboard general pentru mese.
- Pentru MVP poate ramane pagina principala.
- Pe termen mai curat, poate deveni `/admin` sau `/dashboard`.

`/tables/[tableId]`

- Detalii pentru o masa specifica.
- Optional: drawer-ul admin poate fi controlat din URL, ca refresh/share sa pastreze masa deschisa.

### Public

`/feedback/[qrToken]`

- Formularul public deschis dupa scanarea QR-ului.
- `qrToken` identifica masa, restaurantul/eventul si formularul activ.
- Exemplu: `/feedback/masa-12-demo`.

`/feedback/[qrToken]/success`

- Screen separat dupa submit.
- Contine checkmark mare verde si textul:
  `Multumesc, Feedbackul dumneavoastra conteaza pentru noi`
- Ruta separata e mai buna decat doar `setIsSubmitted(true)` pentru ca functioneaza corect dupa refresh si poate fi folosita dupa submit server-side cu redirect.

## Model de date

```ts
type Restaurant = {
  id: string;
  name: string;
  brandColor: string;
};

type Table = {
  id: string;
  restaurantId: string;
  label: string;
  qrToken: string;
};

type FeedbackQuestion = {
  id: string;
  restaurantId: string;
  label: string;
  type: "rating-1-5" | "single-choice" | "text" | "nps";
  required: boolean;
  options?: string[];
};

type FeedbackSubmission = {
  id: string;
  tableId: string;
  createdAt: string;
  answers: FeedbackAnswer[];
};

type FeedbackAnswer = {
  questionId: string;
  value: string | number;
};
```

## Fluxuri principale

### Scanare QR si trimitere feedback

1. Clientul scaneaza QR-ul.
2. Aplicatia deschide `/feedback/[qrToken]`.
3. Serverul rezolva `qrToken` in `restaurant`, `table` si `questions`.
4. `FeedbackForm` randaza intrebarile.
5. Submit-ul apeleaza `submitFeedback`.
6. Server Action valideaza datele si salveaza raspunsul.
7. Dupa succes, utilizatorul este redirectionat la `/feedback/[qrToken]/success`.

### Dashboard admin

1. Dashboard-ul incarca lista de mese si agregatele.
2. Click pe o masa seteaza masa activa.
3. `TableDrawer` arata QR, scanari, raspunsuri, rating si ultimele raspunsuri.
4. Click pe `Vezi intrebarile` deschide `QuestionsDrawer`.
5. Drawer-ul de intrebari foloseste aceeasi dimensiune si acelasi stil ca drawer-ul mesei.

## Layer de date

Pentru MVP:

- `lib/feedback/mock-data.ts` tine datele demo.
- `lib/feedback/queries.ts` expune functii precum `getTables()`, `getTableById()`, `getFeedbackFormByToken()`.
- `lib/feedback/mutations.ts` expune `createFeedbackSubmission()`.

Pentru productie:

- `queries.ts` si `mutations.ts` pot fi mutate pe DB fara sa schimbam componentele.
- Server Actions raman in `app/actions/feedback.ts`.
- Componentele client primesc doar props serializabile.

## Component boundaries

### Server Components

- Pagini si layout-uri.
- Fetch pentru mese, intrebari si agregate.
- Redirect dupa submit.
- Metadata.

### Client Components

- Selectare masa activa.
- Deschidere/inchidere drawer.
- Selectare rating, optiuni si NPS.
- Stare temporara de formular inainte de submit.

## Validare

Validarea trebuie facuta in doua locuri:

- In UI, pentru feedback rapid: campuri required, rating selectat, buton disabled la submit invalid.
- Pe server, obligatoriu: `qrToken` valid, intrebari existente, tipuri corecte, limite pentru text liber.

Regula importanta: clientul nu trebuie sa poata trimite `tableId` arbitrar fara ca serverul sa-l rezolve din `qrToken`.

## Design system

Tokenii principali trebuie extrasi din prototip:

```txt
brand-red: #D5333C
brand-red-dark: #8C1820
brand-gold: #D8B56F
brand-cream: #F7F1E6
surface: #FFFFFF
text-main: #211B18
text-muted: #776D64
success-green: #21A366
radius-card: 8px
```

Cand se adauga componente noi, ele trebuie sa foloseasca aceleasi tokenuri si aceeasi densitate vizuala:

- carduri albe pe fundal crem;
- border fin auriu/bej;
- butoane rosii pentru actiuni principale;
- succes verde doar pentru confirmare finala;
- drawer-uri de aceeasi latime, acelasi radius si aceeasi umbra.

## Pasii recomandati de implementare

1. Mutam tipurile in `lib/feedback/types.ts`.
2. Mutam datele demo in `lib/feedback/mock-data.ts`.
3. Extragem componentele admin din `app/page.tsx` in `components/admin/`.
4. Extragem formularul public in `components/feedback/`.
5. Inlocuim `/feedback` cu `/feedback/[qrToken]`.
6. Cream ruta separata `/feedback/[qrToken]/success`.
7. Introducem `submitFeedback` in `app/actions/feedback.ts`.
8. Abia dupa asta conectam DB/API real.

## Riscuri de evitat

- Sa ramana tot dashboard-ul si formularul intr-un singur `page.tsx`.
- Sa tinem `tableId` ca sursa de adevar in client in loc de `qrToken`.
- Sa facem success screen-ul doar cu state local, pentru ca se pierde la refresh.
- Sa copiem aceleasi clase Tailwind in multe locuri fara componente mici reutilizabile.
- Sa adaugam backend inainte sa stabilim clar modelul `Table -> Question -> Submission -> Answer`.
