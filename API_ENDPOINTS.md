# Endpoint-uri necesare

Lista completa a operatiilor care in acest moment sunt mock/local state in UI si au nevoie de un endpoint real (API route sau Server Action). Grupate pe zona functionala, cu pagina/componenta care le declanseaza si modelul Prisma implicat.

Legenda metoda: `GET` citire, `POST` creare, `PATCH` update partial, `DELETE` stergere.

## 1. Sali (Hall)

Sursa UI: [components/private/PrivateSidebar.tsx](components/private/PrivateSidebar.tsx), [lib/halls-data.ts](lib/halls-data.ts)

| Endpoint | Metoda | Foloseste in | Note |
|---|---|---|---|
| `/api/halls` | GET | Sidebar (lista sali + contor mese/raspunsuri) | Inlocuieste `halls` + `getHallStats()` hardcodat |
| `/api/halls` | POST | Buton "Adauga sala" din sidebar | Momentan buton fara actiune |
| `/api/halls/[hallId]` | GET | Pagina `/[hallId]` (nume sala, validare ca exista) | Inlocuieste `getHall()` |
| `/api/halls/[hallId]` | PATCH | Redenumire sala (nu exista inca in UI, dar e nevoie) | - |
| `/api/halls/[hallId]` | DELETE | Stergere sala (nu exista inca in UI) | Trebuie decis ce se intampla cu mesele ei |

## 2. Mese (Table)

Sursa UI: [app/(private)/[hallId]/page.tsx](app/(private)/[hallId]/page.tsx), [components/private/TablesList.tsx](components/private/TablesList.tsx)

| Endpoint | Metoda | Foloseste in | Note |
|---|---|---|---|
| `/api/halls/[hallId]/tables` | GET | `TablesList` (grid + search + paginare) | Inlocuieste `getHallTables()` |
| `/api/halls/[hallId]/tables` | POST | Buton "Adauga masa" din `TablesList` | Momentan buton fara actiune |
| `/api/tables/[tableId]` | GET | `TableDrawer` (detalii masa: scanari, rating, ultima scanare) | - |
| `/api/tables/[tableId]` | PATCH | Editare nume/status masa (nu exista inca in UI) | - |
| `/api/tables/[tableId]` | DELETE | Stergere masa (nu exista inca in UI) | Cascadeaza QR + raspunsuri, conform schema Prisma |

## 3. QR code

Sursa UI: `TableDrawer` din [app/(private)/[hallId]/page.tsx](app/(private)/[hallId]/page.tsx)

| Endpoint | Metoda | Foloseste in | Note |
|---|---|---|---|
| `/api/tables/[tableId]/qr` | GET | Randare imagine QR in drawer | Momentan hardcodat la `/qr-masa-12.png` pentru toate mesele |
| `/api/tables/[tableId]/qr` | POST | Generare/regenerare QR (buton "Descarca QR" implica ca exista deja) | Trebuie sa creeze `token` unic |
| `/api/tables/[tableId]/qr/download` | GET | Buton "Descarca QR" | Returneaza fisier imagine (PNG/SVG) pentru print |
| `/api/qr/[token]/scan` | POST | Apelat cand clientul scaneaza (nu e inca in UI, e triggerat de scanarea fizica) | Incrementeaza `scanCount`, seteaza `lastScannedAt` |

## 4. Raspunsuri / feedback (FeedbackResponse)

Sursa UI: `QuestionsDrawer` din [app/(private)/[hallId]/page.tsx](app/(private)/[hallId]/page.tsx), [app/feedback/page.tsx](app/feedback/page.tsx)

| Endpoint | Metoda | Foloseste in | Note |
|---|---|---|---|
| `/api/tables/[tableId]/responses` | GET | "Ultimele raspunsuri" din `TableDrawer`, buton "Vezi toate raspunsurile mesei" (nu are inca destinatie) | Suporta paginare |
| `/api/tables/[tableId]/responses/summary` | GET | Agregatele per intrebare din `QuestionsDrawer` (metric + detail) | Calcul server-side, nu se face in client |
| `/api/feedback/[qrToken]` | GET | Formularul public - rezolva `qrToken` in masa + intrebari active | Inlocuieste faptul ca `/feedback` e static, fara `qrToken` |
| `/api/feedback/[qrToken]` | POST | Submit formular din [app/feedback/page.tsx](app/feedback/page.tsx) | Server valideaza `qrToken`, nu accepta `tableId` direct din client |

## 5. Sabloane de intrebari (QuestionTemplate)

Sursa UI: [app/(private)/intrebari/page.tsx](app/(private)/intrebari/page.tsx)

Acest model **nu exista inca in `prisma/schema.prisma`** — schema are doar `Question` legat direct de `Hall`, fara concept de template/versiune. Trebuie adaugat un model nou (`QuestionTemplate` + `TemplateQuestion`) inainte de a implementa aceste endpoint-uri.

| Endpoint | Metoda | Foloseste in | Note |
|---|---|---|---|
| `/api/question-templates` | GET | Lista din stanga (search + card per sablon) | Inlocuieste `questionTemplates` mock |
| `/api/question-templates` | POST | Buton "Sablon nou" | Momentan creeaza doar local state |
| `/api/question-templates/[templateId]` | GET | Editor din dreapta la selectare sablon | - |
| `/api/question-templates/[templateId]` | PATCH | Salvare nume sablon (`onBlur` pe input), buton "Salveaza" | Trebuie sa creeze versiune noua conform notei "Publicarea creeaza o versiune noua..." |
| `/api/question-templates/[templateId]` | DELETE | Stergere sablon (nu exista inca in UI) | - |
| `/api/question-templates/[templateId]/questions` | POST | Buton "+ Adauga intrebare" | - |
| `/api/question-templates/[templateId]/questions/[questionId]` | PATCH | Editare titlu/tip/required per intrebare (nu exista inca UI de editare inline, doar afisare) | - |
| `/api/question-templates/[templateId]/questions/[questionId]` | DELETE | Stergere intrebare din sablon (nu exista inca in UI) | - |
| `/api/question-templates/[templateId]/questions/reorder` | PATCH | Drag-and-drop din editor (`handleDragEnd`) | Trimite noua ordine (`sortOrder`) pentru toate intrebarile |
| `/api/halls/[hallId]/question-template` | PATCH | Asocierea sablon <-> sala (fallback-ul descris in UI: "Daca masa nu are sablon propriu, foloseste sablonul default al salii") | Nu exista inca UI pentru asta, doar cardul informativ "Fallback" |

## Prioritizare recomandata

1. **Read-only pentru dashboard**: `/api/halls`, `/api/halls/[hallId]`, `/api/halls/[hallId]/tables`, `/api/tables/[tableId]` — fara ele, tot dashboard-ul ramane pe date mock.
2. **Formular public + submit**: `/api/feedback/[qrToken]` (GET+POST) — e fluxul de business critic (colectare feedback real).
3. **QR generation**: `/api/tables/[tableId]/qr` + `/download` — necesar ca sa poata fi printate coduri reale.
4. **Raspunsuri/agregate**: `/api/tables/[tableId]/responses(+/summary)` — dashboard-ul devine util abia cand arata date reale, nu mock.
5. **Sabloane de intrebari**: tot blocul 5 — depinde de un model Prisma nou, deci vine ultimul.
