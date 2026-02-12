# Michigan Realty Homepage

Professional realtor homepage for Drew Wodarski, built with Next.js.

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

3.  Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Database Setup

This project uses a local SQLite database to store contacts.

1.  Initialize the database:
    ```bash
    npx prisma db push
    ```

2.  (Optional) View the database in your browser:
    ```bash
    npx prisma studio
    ```

## Admin Console

Access the admin console at `/admin` to view submitted contacts.

## Customization

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
