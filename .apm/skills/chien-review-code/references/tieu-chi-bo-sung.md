# Tiêu chí bổ sung

Tiêu chí phát sinh từ các buổi review cùng Chiến. Mã tiếp theo tiêu chí base (một số mã S đã bỏ vì gắn riêng stack VBDT, không dùng lại): `S1`, `S2`… (số vĩnh viễn, không đánh lại; S12 đã bỏ, không dùng lại).

## Mẫu một mục

```markdown
### S<N> · <tên ngắn>
- **Luật:** một câu, điều kiện quan sát được.
- **Ca gốc:** đoạn code vi phạm (đã bỏ PII, rút gọn).
- **Cách đúng:** đoạn code sau khi sửa.
- **Vì sao:** hại cụ thể hoặc quyết định của Chiến (ngày).
```

Trước khi thêm: tiêu chí này có trùng hoặc đá với B1–B16 không? Có → báo Chiến, không tự chọn.

## Danh sách

### S1 · Không static class chỉ bọc một hàm
- **Luật:** class static chỉ chuyển tiếp một lời gọi sang helper (thêm vài hằng số) mà có ít hơn 2 chỗ gọi → xoá class, gọi thẳng helper.
- **Ca gốc:** `SignatureImageValidator.Validate` chỉ gọi `FileValidationHelper.ValidatePngImageHeader` với 4 hằng số `ValidationConstants.SignatureImage.*`; `HeaderLength` chỉ lặp `PngHeaderLength`; một caller duy nhất (`UserSignatureService.UploadMineAsync`).
- **Cách đúng:** `UploadMineAsync` gọi `FileValidationHelper.PngHeaderLength` và `ValidatePngImageHeader(...)` trực tiếp.
- **Vì sao:** B2 — không thêm class phụ khi đủ rồi; Chiến chốt xoá (2026-10-21). Có chỗ gọi thứ hai thật sự (không phải dự đoán) thì mới đáng giữ class.

### S2 · Chuẩn hoá đầu vào ở đúng một chỗ
- **Luật:** hàm kiểm tra hoặc tự chuẩn hoá đầu vào, hoặc tin caller đã chuẩn hoá; không làm cả hai. Quy tắc suy ra từ đường dẫn / key (thư mục gốc) nằm cạnh dữ liệu nó dùng (danh sách thư mục công khai).
- **Ca gốc:** `S3FileStorageService.ResolveBucket` đã `Trim().Trim('/')` và cắt thư mục gốc, rồi `StorageFolders.IsPublic` lại `Trim().Trim('/')` trên chuỗi đó.
- **Cách đúng:** `IsPublic(folderOrKey)` tự lấy thư mục gốc; `ResolveBucket` chỉ gọi `StorageFolders.IsPublic(folderOrKey)`.
- **Vì sao:** tiêu chí gọn-dễ-đọc câu 1 (một việc một chỗ); Chiến chốt gộp (2026-10-21).

### S4 · Thông báo lặp trong một validator dùng `const`
- **Luật:** cùng một chuỗi thông báo xuất hiện từ 3 lần trở lên trong một class validator → khai `private const string` ở đầu class (B1 áp cho `WithMessage`). Dưới 3 lần: viết thẳng.
- **Ca gốc:** `CursorPaginationRequestValidator<T>` viết `.WithMessage("Con trỏ trang không hợp lệ")` ở hai rule (độ dài và parse cursor).
- **Cách đúng:** `private const string InvalidCursorMessage = "Con trỏ trang không hợp lệ";` rồi `.WithMessage(InvalidCursorMessage)`.
- **Vì sao:** B1 — message lặp thì `const`, đổi chữ một nơi (2026-10-21). Ngưỡng nâng từ 2 lên 3 (2026-11-27); ca gốc ở đây chỉ lặp 2 lần nên nay sẽ viết thẳng.

### S6 · Thời hạn cache / timeout không hard-code, đẩy ra appsettings, đơn vị giây
- **Luật:** hằng thời gian nghiệp vụ (TTL cache, timeout, chu kỳ) không viết `TimeSpan.From…(n)` trong code; đặt giá trị ở `appsettings.*.json` đơn vị **giây** (số nguyên), đọc qua options đã bind.
- **Ca gốc:** `private static readonly TimeSpan ExpireAfter = TimeSpan.FromHours(24);` lặp ở `RoleService`, `PositionService`, `SystemKeyService` (`_expireAfter`), `TrustedCaService` (5 phút).
- **Cách đúng:** key kiểu `CacheSettings:RoleExpireSeconds: 86400` trong `appsettings.Development.json`, service nhận qua options và dùng `TimeSpan.FromSeconds(options.RoleExpireSeconds)`.
- **Vì sao:** đổi thời hạn không cần build lại, mỗi môi trường chỉnh được; giây cho dễ tính. Chiến chốt (2026-10-21). Presigned URL: xem S57 (đơn vị phút).

### S14 · Logic đặt trong service của luồng sở hữu nó, không theo tên gần giống
- **Luật:** hàm đặt ở service của luồng nghiệp vụ mà nó thuộc về (ai gọi, cùng transaction với ai, đổi trạng thái gì), không đặt vì tên hoặc lịch sử cũ. Hàm chỉ một caller và là một bước của luồng đó thì gộp vào service đó (private nếu không ai khác dùng); không kéo thêm dependency vào service khác chỉ để chứa nó.
- **Ca gốc:** `DocumentNotificationService.MarkSignedInTxAsync` (đặt `Document.Status = Signed`, chuyển hồ sơ sang ReadyToPublish) chỉ được `DocumentSignService.CompleteSignAsync` gọi trong transaction ký bước cuối; phần thông báo đã bỏ từ `246f463c` nên service còn lại chỉ có `GetListAsync` mà vẫn phải nhận `IDossierService`.
- **Cách đúng:** chuyển vào `DocumentSignService` (private), bỏ khỏi `IDocumentNotificationService`, bỏ `IDossierService` khỏi constructor `DocumentNotificationService`.
- **Vì sao:** chỗ đặt hàm quyết định ai phụ thuộc ai; đặt theo cảm tính làm ranh giới sai và thêm coupling thừa. Chiến chốt (2026-10-21).

### S16 · Không tách hàm khi chỉ để dựng một object ở hai chỗ gọi
- **Luật:** hàm private chỉ dựng một object (khởi tạo property) và có ≤ 2 chỗ gọi thì viết thẳng tại chỗ; không tách helper để "khỏi lặp". Tách khi có logic thật (nhánh, tính toán) hoặc từ 3 chỗ gọi.
- **Ca gốc:** `DocumentService.NewDocumentFile(documentId, fileName, objectKey)` chỉ gán 6 property cho `DocumentFile`, gọi ở `StageFilesAsync` và `InsertImportFilesAsync`.
- **Cách đúng:** mỗi chỗ gọi viết `new DocumentFile { … }` tại chỗ, xoá hàm.
- **Vì sao:** B2 — hàm bọc không thêm ý nghĩa, người đọc phải nhảy đi xem; hai object khởi tạo giống nhau vẫn dễ đọc hơn. Chiến chốt (2026-10-21).

### S21 · Hàm private chỉ một chỗ gọi, không có logic dùng lại → viết thẳng tại chỗ
- **Luật:** mở rộng S16. Hàm private chỉ có một chỗ gọi, không có logic nào chỗ khác dùng lại, thì ném lên trên vào hàm gọi nó; không tách để "cho gọn" hay để test được. Giữ khi có ≥ 2 chỗ gọi và có logic thật (nhánh, tính toán), hoặc khi tách là điều kiện bắt buộc để viết đúng.
- **Ca gốc:** `EnrichPublicLookupAsync` chỉ được `GetPublicLookupAsync` gọi; `BuildPublicFields` có `switch` định dạng giá trị, Chiến không muốn tách hàm private cho nhánh `switch` (2026-10-21). Năm test gọi thẳng `EnrichPublicLookupAsync` bị xoá vì Chiến coi test không gọi API thật là rác.
- **Cách đúng:** inline thân hàm vào `GetPublicLookupAsync`; không tách nhánh `switch`.
- **Vì sao:** B2 — người đọc phải nhảy sang hàm khác mà không được gì. Test không gọi API thật không đủ lý do để giữ một hàm tách riêng. Chiến chốt (2026-10-21).

### S23 · Một nhánh điều kiện, một chỗ xử lý: đừng chia nửa trong helper, nửa ngoài
- **Luật:** hai khối cùng rẽ nhánh theo một điều kiện (ở đây `DocumentTypeSchemaID.HasValue`) và cùng lo một dữ liệu (`FieldData`) thì gộp vào một chỗ; đọc một lần phải thấy hết cách `FieldData` được quyết và kiểm. Helper thuần (static, test được) chỉ giữ nguyên nếu phần nằm ngoài thật sự là việc khác (I/O), và khi đó đặt chúng sát nhau, cùng một tên khối.
- **Ca gốc:** `DocumentService.UpdateAsync` gọi `ResolveFieldDataForUpdate(existing, requestFieldData)` (đã rẽ `!HasValue`), rồi ngay dưới lại `if (existing.DocumentTypeSchemaID.HasValue)` lấy schema ghim và `Validate(requestFieldData)`.
- **Cách đúng:** gộp thành một bước trong `UpdateAsync` (hoặc một hàm async nhận cả `schemaService`/`fieldDataValidator`) trả `(FieldData, DocumentTypeSchemaID)` đã kiểm; hoặc giữ helper thuần cho quyết định giá trị và chuyển nốt khối lấy schema + validate vào cùng hàm đó. Lưu ý đổi sang async/không thuần thì test `ResolveFieldDataForUpdate` phải viết lại.
- **Vì sao:** tiêu chí gọn-dễ-đọc mục 1 (một việc một chỗ). Reviewer nêu đúng điểm này; phần chưa đủ là nó bỏ qua cái giá: helper hiện thuần nên test được không cần DB/mock. Chưa sửa code, chờ Chiến chọn (2026-10-21).

### S24 · Biểu thức LINQ lồng sâu: rút phần tra cứu ra biến cục bộ, vẫn không tách hàm
- **Luật:** biểu thức LINQ lồng từ 3 cấp (`Join` trong `Select` trong `Join`) kèm tra cứu tuyến tính (`FirstOrDefault` trong lambda) → dựng sẵn `Dictionary` (hoặc biến) ngay trước biểu thức, rồi xuống dòng theo từng cấp. Vẫn viết tại chỗ, không tách hàm private khi chỉ có một chỗ gọi (S21).
- **Ca gốc:** `DocumentService.BuildPublicFields` nhánh `JsonArray ... FieldKind.List` nằm trên một dòng, mỗi phần tử gọi `fieldDef.Items?.FirstOrDefault(i => i.Code == p.Key)`.
- **Cách đúng:** `var itemLabels = fieldDef.Kind == FieldKind.List ? fieldDef.Items?.ToDictionary(i => i.Code, i => i.Label) : null;` rồi `itemLabels?.GetValueOrDefault(p.Key) ?? p.Key`, chia dòng theo từng cấp `Join`/`Select`/`Where`.
- **Vì sao:** reviewer đề nghị tách hàm `foreach`, đá với S21; Chiến chọn giữ tại chỗ và chỉ rút tra cứu (2026-10-21). Lý do "tốn CPU" yếu: `Items` bị chặn tối đa `MaxListItemFields` trường con, nên điểm đáng sửa là độ đọc, không phải hiệu năng.

### S35 · Interface một implementation, không ai tiêm hay mock qua nó thì xoá
- **Luật:** interface chỉ có một class implement, không đăng ký DI, không constructor nào nhận nó, không test nào mock nó → xoá interface, class đứng một mình. Kiểm bằng tên interface trên toàn `app/` (code + test) trước khi xoá. Giữ khi có ít nhất một chỗ tiêm qua interface, hoặc test mock nó thật.
- **Ca gốc:** `IDocumentMetadataMigrator` (một method `RunAsync`) chỉ có `DocumentMetadataMigrator` implement; `MaintenanceTools` tạo class cụ thể bằng `ActivatorUtilities.CreateInstance<DocumentMetadataMigrator>`, test chỉ gọi hàm `internal static`.
- **Cách đúng:** xoá khối `interface` và `: IDocumentMetadataMigrator`; `RunAsync` vẫn `public` trong class.
- **Vì sao:** B2 — interface không ai dùng là một tầng gián tiếp thừa. Chiến chốt (2026-10-22).

### S39 · Danh sách Id đã có validator thì service không kiểm null / rỗng
- **Luật:** `Ids` của request có `NotEmpty()` ở validator (`BulkDeleteGuidRequestValidator`) và DTO khởi tạo `= []` thì service không `if (ids is null || ids.Count == 0)`. Tham số kiểu không-nullable không cần `is null`. Cùng S7, S32.
- **Ca gốc:** `DocumentTypeService.DeleteAsync` mở đầu `if (ids is null || ids.Count == 0) return Result.Success;`.
- **Cách đúng:** xoá dòng; service dùng `ids.Distinct()` ngay.
- **Vì sao:** một quy tắc đầu vào một tầng; nhánh `return Result.Success` cho danh sách rỗng còn che lỗi 400 mà validator đã chặn. Chiến chỉ ra (2026-10-22).

### S41 · Không khai record riêng chỉ để đọc một khoá JSON; dùng kiểu có sẵn
- **Luật:** đọc JSON config chỉ lấy một khoá thì `FromJson<Dictionary<string, List<…>>>()` rồi `GetValueOrDefault("khoá")`, không khai `private record X(List<…>? Khoá)`. Cấm khai cùng một record riêng ở hai class: nếu thật sự cần kiểu, đặt một chỗ chung (DTO / Models) rồi dùng lại.
- **Ca gốc:** `private record PushConfig(List<string?>? Endpoints)` trong `DossierPushService` và `private record RawConfig(List<string?>? Endpoints)` trong `ExternalPushModule`, hai bản y hệt cho cùng config `{"endpoints":[...]}`.
- **Cách đúng:** `configJson.FromJson<Dictionary<string, List<string?>>>()`, `config.Value.GetValueOrDefault("endpoints") ?? []`; bỏ cả hai record.
- **Vì sao:** B2 — kiểu phụ không thêm nghĩa, hai bản dễ lệch. Chiến chỉ ra (2026-10-22). Lưu ý: khoá `Dictionary` phân biệt hoa thường, config lưu `endpoints` chữ thường nên khớp.

### S42 · Message đã vào hàng đợi thì không tra lại cấu hình nguồn
- **Luật:** payload Outbox đã qua kiểm lúc đẩy vào (producer / `ValidateConfig`). Consumer tin payload và chỉ tra những gì nó cần để gửi (URL, header, file), không đọc lại hồ sơ, loại hồ sơ, module, config để kiểm "còn bật không" hay parse lại. Cấu hình đổi sau khi message đã xếp hàng thì mặc kệ, message chạy theo trạng thái lúc xếp. Mở rộng S31; gỡ ngoại lệ (c) "consumer đọc message do nơi khác ghi" của S31.
- **Ca gốc:** `DossierPushService.ResolveEndpointAsync` (3 truy vấn: `Dossier.GetById`, `DossierTypeModule.GetByDossierTypeId`, parse `ConfigJson`) chỉ để xác nhận tên endpoint trong payload còn nằm trong config module rồi mới tra `DossierPushOptions`; comment "kiểm lại vì consumer đọc DB do cổng khác ghi".
- **Cách đúng:** consumer tra thẳng `options.Value.Endpoints.FirstOrDefault(e => e.Name == payload.EndpointName)`; không có thì `Error.Failure` để Outbox retry.
- **Vì sao:** tư duy sai là "dữ liệu có thể đã đổi nên kiểm lại"; ngược lại, message đã vào là đã chốt nguồn. Bớt 3 truy vấn và một nhánh lỗi. Chiến chốt (2026-10-22).

### S43 · Logic chỉ consumer dùng thì nằm trong consumer, không tách service + interface
- **Luật:** logic xử lý message Outbox chỉ có một chỗ gọi là `HandleAsync` của consumer thì viết thẳng trong class consumer (`Consumers/`), lấy phụ thuộc từ `scope.ServiceProvider` như `SendOtpZaloConsumer`. Không tạo `XService` + `IXService` (đăng ký DI, một implementation, một caller) rồi để consumer chỉ gọi một dòng. Tách service chỉ khi có từ hai chỗ gọi thật. Tên class phản ánh bản chất: thứ chạy từ hàng đợi là `…Consumer`, không `…Service`. Cập nhật S14, S35.
- **Ca gốc:** `PushDossierExternalConsumer` chỉ `GetRequiredService<IDossierPushService>().PushAsync(...)`; `DossierPushService` (~130 dòng, một caller duy nhất) đặt ở `Services/` và đăng ký DI.
- **Cách đúng:** nhập logic vào `PushDossierExternalConsumer.HandleAsync`; xoá `DossierPushService.cs` và dòng `AddScoped<IDossierPushService, …>`.
- **Vì sao:** B2 + S14 + S35 — bản chất là consumer nên ở đúng chỗ, đúng tên; tôi đã nói "đáng tách" lúc trước là sai vì chưa xét điều này. Chiến chỉ ra (2026-10-22).

### S44 · Options là class cấu hình thường, không kèm bộ kiểm riêng
- **Luật:** class `*Options` chỉ gồm `SectionName` và các property có giá trị mặc định; đăng ký bằng `services.Configure<T>(GetSection(...))`. Không thêm hàm `Validate()` tự viết, không class `*OptionsValidator : IValidateOptions<T>`, không `ValidateOnStart()`, không danh sách hằng "cấm" kiểu `ForbiddenHeaders`. Dev khai config sai thì lỗi lộ lúc chạy, đó là chấp nhận được. Chỉ thêm kiểm khi USER yêu cầu, hoặc dùng `DataAnnotations` một dòng (`[Range]`, `[Required]`) nếu thật sự cần.
- **Ca gốc:** `DossierPushOptions` có `Validate()` ~35 dòng (https-only, không query, Method chỉ POST/PUT, Timeout 1–600, header cấm, header trùng), `DossierPushOptionsValidator`, hai dòng đăng ký `IValidateOptions` và `ValidateOnStart`.
- **Cách đúng:** `DossierPushOptions { Endpoints }` + `DossierPushEndpoint { Name, Url, Method, TimeoutSeconds, Headers }`, chỉ còn `Configure<DossierPushOptions>`.
- **Vì sao:** B2 — config do dev tự khai, không phải đầu vào người dùng; ~80 dòng kiểm thừa cho thứ chỉ có dev đụng tới. Chiến chốt (2026-10-22). Còn `NhSyncOptionsValidator`, `RepresentativeSyncOptionsValidator`, `DossierIntakeOptionsValidator` cùng kiểu, chưa xét.

### S46 · Khối giống hệt lặp ≥ 3 chỗ: đưa vào nơi dùng chung, tham số là dữ liệu, không là lambda
- **Luật:** cùng một khối (≥ 3 dòng) lặp từ 3 chỗ gọi trở lên thì gom vào đúng một chỗ (S16/S29 cho phép tách từ 3 chỗ). Khi phần khác nhau giữa các chỗ chỉ là dữ liệu (ở đây `byte[]? qrCodeBytes`), truyền dữ liệu đó làm tham số, không truyền `Action<T>` / lambda cấu hình rồi mỗi chỗ gọi tự viết lại cùng thân lambda.
- **Ca gốc:** `EmailService`: ba hàm (`SendPasswordTokenEmailAsync`, `SendWelcomeEmailAsync`, `SendDocumentPublishedEmailAsync`) cùng truyền `bodyBuilder => { if (qrCodeBytes is { Length: > 0 }) { var attachment = bodyBuilder.LinkedResources.Add("qrcode.png", …); attachment.ContentId = "qrcode-image"; } }` vào `SendEmailInternalAsync(…, Action<BodyBuilder>? configureBody, …)`, trong khi `configureBody` chỉ dùng để gắn QR.
- **Cách đúng:** `SendEmailAsync(toEmail, subject, htmlBody, byte[]? qrCodeBytes, ct)` tự gắn QR khi có; ba chỗ gọi chỉ truyền `qrCodeBytes`, hai chỗ không QR truyền `null`.
- **Vì sao:** B2 + tiêu chí gọn-dễ-đọc câu 1 — một việc một chỗ; callback tổng quát mà chỉ một cách dùng là độ phức tạp thừa. Chiến chỉ ra (2026-10-22). Cùng file khối `try { CompileRenderAsync } catch { return ex.ToFailureError(); }` lặp 5 lần cũng gom vào `SendEmailAsync<T>(…, templatePath, model, …)` (generic để giữ kiểu model cho RazorLight, render trước bước kiểm `IsRunSendMail` như cũ).

### S48 · Thông báo tiếng Việt phải toàn chữ Latin: quét chữ lạ trước khi xong
- **Luật:** chuỗi thông báo / mã lỗi / comment tiếng Việt chỉ gồm chữ Latin có dấu. Ký tự Kirin (U+0400–U+04FF) trông giống Latin ("Т", "а", "е", "о", "р", "с") dán lẫn vào chữ Việt là lỗi, vì so sánh chuỗi và tìm kiếm trong log / test sẽ không khớp. Khi sửa file có thông báo, quét mã điểm: `python -c "import sys;print(sum(0x400<=ord(c)<=0x4FF for c in open(sys.argv[1],encoding='utf-8').read()))" <file>`.
- **Ca gốc:** `UserService.CreateInTxAsync` có 3 chuỗi "Тên đăng nhập & Địa chỉ email đã tồn tại trong hệ thống" với chữ "Т" là U+0422 (Kirin), không phải "T" Latin.
- **Cách đúng:** gõ lại bằng Latin và gom thành một `const` (S4): `private const string UserNameOrEmailExistsMessage = "Tên đăng nhập & Địa chỉ email đã tồn tại trong hệ thống";`.
- **Vì sao:** B3 — thông báo lấy từ một nơi, đúng chữ. Phát hiện khi đọc cả file `UserService` (2026-10-22); `rg` thường không thấy vì mắt đọc ra giống hệt.

### S57 · Thời hạn presigned URL chỉ một nguồn: `SeaweedS3:PresignedUrlExpiryMinutes`
- **Luật:** mọi presigned URL (xem, tải, xem trước, upload, ảnh công khai) lấy thời hạn từ `SeaweedS3:PresignedUrlExpiryMinutes` (phút). Nơi gọi `GetPresignedUrl` / `GetPreviewUrl` / `GetPresignedUploadUrl` không truyền `expiry`, không `TimeSpan.From…` hard-code, không thêm key riêng ở `CacheSettings` hay options khác. `ExpiresAt` trả cho client tính từ chính key đó. Tham số `expiry` giữ vì là hạ tầng, `IFileStorageService` thuộc ngoại lệ S47. Ngoại lệ đơn vị của S6: key này giữ **phút** (đã có sẵn); S6 vẫn áp cho mọi key thời hạn khác.
- **Ca gốc:** ba nguồn song song: `SeaweedS3:PresignedUrlExpiryMinutes` (15 phút), `CacheSettings:SignaturePreviewSeconds` / `FieldImageViewSeconds` / `FieldImagePublicViewSeconds`, và `TimeSpan.FromMinutes(15)` / `(5)` hard-code ở `DocumentSignService`.
- **Cách đúng:** `fileStorageService.GetPresignedUrl(key, disposition: ContentDispositionType.Inline)`, không tham số thời hạn ở service gọi.
- **Vì sao:** mỗi service tự thêm một key thì đổi thời hạn phải đi tìm nhiều chỗ, và `ExpiresAt` dễ lệch với URL đã ký. Chiến chốt một chỗ duy nhất (2026-11-02). Hệ quả đã chấp nhận: ảnh công khai từ 60 giây lên bằng giá trị key.

### S63 · Đặt tên phương thức và biến theo nghiệp vụ (Domain), không dùng từ kỹ thuật CSDL (`row`, `rows`)
- **Luật:** Tên method nội bộ và biến trong Service phải mang danh xưng thực thể nghiệp vụ (ví dụ: `GetSignatureByIdAsync`, `GetMineSignaturesAsync`, `GetSignaturesByIdsAsync`, biến `signature`, `signatures`, `item`, `items`, `user`, `role`). Tuyệt đối không đặt tên là `GetRowAsync`, `GetRowsByIdsAsync`, `GetMineRowsAsync`, hay đặt biến `var row = ...`, `var rows = ...`.
- **Ca gốc:** `UserSignatureService` đặt các hàm `GetRowAsync`, `GetMineRowsAsync`, `GetRowsByIdsAsync` và rải rác biến `row`, `rows`.
- **Cách đúng:** Đổi thành `GetSignatureByIdAsync`, `GetMineSignaturesAsync`, `GetSignaturesByIdsAsync`, biến `signature`, `signatures`.
- **Vì sao:** Tầng Service là tầng logic nghiệp vụ, tư duy và định danh phải theo Entity/Domain chứ không theo khái niệm vật lý dòng bảng ("row") của CSDL. Chiến chốt (2026-11-02).


### S65 · Cấm `string.IsNullOrWhiteSpace` / `string.IsNullOrEmpty`, dùng `IsEmpty()` / `IsNotEmpty()` của ResultLib
- **Luật:** không viết `string.IsNullOrWhiteSpace(...)` hay `string.IsNullOrEmpty(...)`. Dùng extension `.IsEmpty()` / `.IsNotEmpty()` (`using ResultLib.Extensions;`) trên chuỗi.
- **Ca gốc:** `if (string.IsNullOrEmpty(hash)) return false;` · `.When(x => !string.IsNullOrWhiteSpace(x.Query))`
- **Cách đúng:** `if (hash.IsEmpty()) return false;` · `.When(x => x.Query.IsNotEmpty())`
- **Vì sao:** một cách viết thống nhất toàn dự án, ngắn hơn, null-safe. Chiến chốt (2026-11-27); đã quét và sửa toàn BE.
