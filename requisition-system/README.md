# Requisition System (Laravel + Livewire)

## Run locally

Open PowerShell in this folder and run:

```powershell
php artisan serve
```

Then open http://127.0.0.1:8000.

If this is the first terminal opened after the PHP installation, close and reopen PowerShell first so the updated PATH is loaded.

## Prototype workflow

Use the **View as** selector to test the requester, coordinator, finance, custodian, and purchasing views. The demo uses the Laravel session for its sample workflow data, so changes persist while the browser session remains active.

The next production step is replacing the demo session data with authenticated users and database models/migrations.
