# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Run locally

Install dependencies and run the Vite dev server:

```powershell
cd path/to/repo
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.


---

## Atma Library Frontend Notes

This project has been extended to support a landing page and role-aware member/officer pages for the Atma Library application.

Backend integration notes (Laravel):
Notes/Requirements:

Frontend features added:

If you need help wiring new backend endpoints or adding migrations, ask and I can propose the Laravel migration and resource controller examples.

### Example Laravel Migration (Fines)
If your backend does not have a fines table, here's a simple migration example that adds a `fines` table that references `pinjams` (loans):

php artisan make:migration create_fines_table --create=fines

Example migration content (database/migrations/xxxx_create_fines_table.php):
```
Schema::create('fines', function (Blueprint $table) {
	$table->id();
	$table->foreignId('pinjam_id')->constrained('pinjams')->onDelete('cascade');
	$table->unsignedBigInteger('amount');
	$table->text('reason')->nullable();
	$table->foreignId('created_by')->constrained('users');
	$table->timestamps();
});
 - GET /anggota => return the current member profile (used by frontend as /anggota — not /user)
 - PUT /anggota => update the current member profile (handled by `updateMemberProfile` in the frontend)
 - DELETE /anggota => delete the current member profile/account
php artisan make:migration create_kategori_table --create=kategori

Example migration content:
```
Schema::create('kategori', function (Blueprint $table) {
	$table->id();
	$table->string('nama');
	$table->timestamps();
});
```

### Seed Admin
In database seeders, insert a single admin user with known credentials and assign role 'petugas' or similar.
```
User::create(['name'=>'Admin', 'email'=>'admin@gmail.com', 'password'=>Hash::make('admin12345'), 'role'=>'petugas']);
```

Add an inline message suggesting how the backend should return role after registration?

### Example registration response (recommended)
When the backend accepts a registration, it's helpful to return both the token and the role so the frontend can store and route the user accordingly. A recommended response shape is:

```json
{
	"token": "<jwt-token>",
	"role": "anggota", 
	"user": {
		"id": 123,
		"nama": "Ricky",
		"email": "ricky@example.com"
	}
}
```

The frontend reads `role` from the top-level response (or `response.user.role`) and saves it under `sessionStorage.user_role`, which is used for role-aware redirects and rendering.