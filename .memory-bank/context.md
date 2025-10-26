# Context

Last updated: 2025-10-26

Current work focus
- **iOS Profile Screen:** Completed full profile screen with beige + liquid glass design.
- Admin CRUD endpoints fully implemented and tested.
- Web CMS fully functional with templates management (create, edit, delete, publish/unpublish).
- File upload system working with thumbnail management and automatic cleanup.
- Local development setup optimized (DB in Docker, server and web-cms run locally).

Recent changes
- ✅ **iOS Profile Screen (2025-10-26):**
  - Completed full profile screen with card-based layout matching Home design
  - Created ProfileComponents: HeroCard, StatCard, SettingsRow, SettingsToggleRow, DangerButton
  - Implemented ProfileView with sections: Hero, Stats, Account, Preferences, About, Danger Zone
  - Created ProfileEditView modal with form validation (name, email)
  - Integrated with CompactHeader settings button (fullscreen modal)
  - Added signOut() method to AuthViewModel
  - No linter errors, ready for testing
- ✅ **iOS UI Redesign (2025-10-26):**
  - Implemented beige + liquid glass minimalist design theme
  - Updated GlassTokens with warm beige color palette (#F5E6D3, #D4C4B0, #F4E4C1, #E8D5D0)
  - Reduced blur (25→15), shadow (25→18), and border thickness for minimalist aesthetic
  - Updated all text colors to dark brown (#4A3F35) for proper contrast on light background
  - Updated all components: GlassComponents, TemplatesHomeView, CompactHeader, HeroStatsCard, CategoryChip
  - No linter errors, ready for testing on simulator
- ✅ Completed admin CRUD endpoints (Phase 2):
  - GET /v1/admin/templates (list with full admin fields including slug, status, visibility, tags)
  - POST /v1/admin/templates (create template)
  - GET /v1/admin/templates/{slug} (get by slug)
  - PUT /v1/admin/templates/{slug} (update template)
  - DELETE /v1/admin/templates/{slug} (delete template with file cleanup)
  - POST /v1/admin/templates/{slug}/publish (publish with thumbnail validation)
  - POST /v1/admin/templates/{slug}/unpublish (unpublish)
  - POST /v1/admin/templates/{slug}/assets (upload thumbnail with multer)
- Prisma schema updated with full template fields:
  - Added slug (unique), description, status (enum), visibility (enum), tags (array), createdAt, updatedAt
  - Migration applied: 20251026105027_add_admin_fields_to_templates
- Static file serving configured with ServeStaticModule (process.cwd()/public)
- File upload with automatic cleanup: old thumbnails deleted when uploading new ones, files deleted when template is deleted
- Web CMS UI complete: create, edit (with thumbnail change), delete, publish/unpublish all working
- Local dev setup: only DB in Docker, server (yarn start:dev) and web-cms run on host for better DX

Decisions
- Use multer (@nestjs/platform-express) for file upload handling
- Store uploaded files in public/thumbnails/ with pattern: {slug}-{kind}-{timestamp}.{ext}
- Auto-delete old files when uploading new thumbnails or deleting templates (disk cleanup)
- Use process.cwd() for static file path to work in both dev and prod
- Admin endpoints use full TemplateAdmin type with all fields, public endpoints use minimal Template type
- Run server and web-cms locally for hot-reload, only DB in Docker

Next steps
- **Complete iOS UI redesign with beige theme and minimalist glass effects**
- Add filtering/sorting to admin list endpoint (status, visibility, tags, search)
- Implement template_versions table for prompt management
- Add template_assets table for multiple asset types (preview, cover)
- Add E2E tests for admin endpoints
- iOS app integration with new template fields

References
- .implementation_plan/profile-screen-design.md → Profile screen implementation plan
- .implementation_plan/ui-redesign-beige-minimalist.md → UI redesign implementation plan
- AIPhotoApp/AIPhotoApp/Views/Common/ProfileComponents.swift → Profile components
- AIPhotoApp/AIPhotoApp/Views/Home/ProfileView.swift → Profile main screen
- AIPhotoApp/AIPhotoApp/Views/Home/ProfileEditView.swift → Profile edit modal
- AIPhotoApp/AIPhotoApp/Views/Common/GlassComponents.swift → Glass design system
- server/src/templates/templates-admin.controller.ts → Admin CRUD endpoints
- server/src/templates/templates.service.ts → Business logic with file cleanup
- server/src/templates/dto/ → DTOs (CreateTemplateDto, UpdateTemplateDto, UploadAssetDto)
- web-cms/src/components/templates/ → UI components (TemplateFormDialog, TemplateTable)
- .box-testing/json/templates-sample.json → Sample data for testing (13 templates)
- server/scripts/import-from-box-testing.ts → Script to import sample data
