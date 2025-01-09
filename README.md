# Projekt dyplomowy - Marcin Bereta, Adrian Żerebiec
## Streszczenie
Projekt dyplomowy skupiał się na wykorzystaniu sztucznej inteligencji do generowania quizów oraz zastosowaniu elementów grywalizacji do wspomagania nauki. W tym celu stworzono aplikację mobilną o nazwie QuizGenius, która umożliwia automatyczną generację pytań do tekstu zawartego w kursie. Pozwala to twórcom treści na skoncentrowanie się na jakości dostarczanych materiałów, które dodatkowo są weryfikowane przez uprawnione osoby. Co więcej, aplikacja ułatwia użytkownikom wybór kolejnych kursów na podstawie poprzednich aktywności. QuizGenius pozwala na testowanie swojej wiedzy poprzez rozgrywanie quizów. W celu zwiększenia przyjemności w nauce udostępniono możliwość rywalizacji ze znajomymi, a także innymi losowymi graczami. Użytkownik może śledzić swoje postępy dzięki systemowi osiągnięć i statystyk, który motywuje do dalszego rozwoju swoich umiejętności. Projekt dyplomowy miał również za zadanie przeanalizowanie użyteczności sztucznej inteligencji w tego typu aplikacjach. 

QuizGenius został stworzony z wykorzystaniem popularnych technologii. Interfejs użytkownika został stworzony w React Native. Komunikuje się on za pomocą narzędzia GraphQL z serwerem zaimplementowanym w NestJS. Aplikacja mobilna wykorzystuje jako bazę danych PostgreSQL, a do systemy pamięci podręcznej użyto oprogramowania Redis. System sztucznej inteligencji został oparty o model językowy GPT-4o mini, który został zintegrowany z aplikacją dzięki API firmy OpenAI. W ramach projektu udało się zrealizować wszystkie opracowane w trakcie tworzenia wizji produktu funkcjonalności, a także wyciągnąć wnioski na temat użyteczności sztucznej inteligencji do generowania quizów na podstawie tekstu.

## Uruchomienie aplikacji w środowisku developerskim

### Potrzebne programy i narzędzia
- Android Studio
- Docker Desktop
- Visual Studio Code
- Node.js
- NPM (Node Package Manager)

### Kroki i komendy potrzebne do uruchomienia aplikacji
Początkowo należy zainstalować wskazane powyżej programy oraz narzędzia. Następnie warto uruchomić Android Studio, wybrać w nim odpowiedni katalog oraz dodać emulator, na którym uruchamiana będzie aplikacja. W tym samym czasie należy uruchomić terminale oraz Docker Desktop, w dzięki któremu uruchomione będą kontenery związane z projektem. Kolejnym krokiem jest wykonanie w terminalach komend przygotowujących do uruchomienia. Jeśli się to powiedzie i nie pojawią się żadne błędy środowiskowe można użyć komend uruchamiających backend oraz frontend w odpowiednich katalogach.

W sytuacji jeśli, klucz API od OpenAI znajdujący się w pliku .env wygaśnie, bądź przestanie działać należy zastąpić go nowym. Potrzebne będzie do tego konto na stronie OpenAI, gdzie będzie można dodać wygenerować nowy klucz (do wykonywania zapytań potrzebne będą dostępne środki na koncie). W tym pliku są dostępne również klucze dostępów do baz, które z czasem również mogą ulec przedawnieniu i będzie trzeba je zastąpić nowymi, które możemy uzyskać zakładając konto na platformie supabase.

#### Katalog główny projektu
Przygotowanie do uruchomienia:
- `npm install`
- `docker compose up -d postgresql redis`

#### Katalog api
Przygotowanie do uruchomienia:
- `npm install`
- `npx prisma db push`

Uruchomienie backendu:
`npm run dev`

#### Katalog app
Przygotowanie do uruchomienia:
`npm install`

Uruchomienie frontendu:
`npm run android`

Dodatkowo w tym katalog w pliku constans.ts należy zmienić adres IP na swój adres IPv4, który można znaleźć wykorzystując komendę ipconfig w system Windows.
