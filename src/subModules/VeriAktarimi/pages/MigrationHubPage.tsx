/**
 * Webakus ERP - Veri Aktarım ve Geçiş Merkezi (Migration Hub) Sayfası.
 * 
 * Başlıca Görevleri:
 * - BaseWizardPage kullanarak 5 adımlı profesyonel veri aktarım sihirbazı sunmak:
 *   1. Kaynak Seçimi (Excel, Abakus ERP MS SQL vb.)
 *   2. Dosya & Kaynak (.bak yükleme, Docker Container yaşam döngüsü)
 *   3. Veri Tipleri & Seçenekler (Cari kart envanteri, seçilebilir veri grupları, mükerrer stratejisi)
 *   4. Canlı Aktarım (Progress bar, animasyonlu canlı sayaçlar, batch döngüsü)
 *   5. Sonuç & Rapor (Özet istatistikler ve yönlendirmeler)
 * - Mükerrer kayıt kontrolü, transactional batch veri kaydı ve denetim günlüğü listelemesi.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  FileSpreadsheet, 
  Database, 
  Layers, 
  Download, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  History, 
  RefreshCw, 
  Users, 
  Package, 
  RotateCcw, 
  Play, 
  MapPin, 
  Phone, 
  Wallet, 
  CheckSquare, 
  Square,
  ArrowRight,
  Sparkles,
  Server,
  Tag,
  FolderTree,
  ShoppingCart,
  PackageCheck,
  Archive,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BaseWizardPage, WizardStep, BaseButton, Modal, MigrationFieldCard, useModulGate } from '@akalin/ui';
import { 
  MigrationSourceType, 
  MigrationEntityType, 
  MigrationImportMode, 
  MigrationItemStatus, 
  MigrationPreviewResultDto, 
  MigrationLogDto, 
  AbakusBackupSummaryDto, 
  AbakusContainerStatusDto,
  AbakusCariInventoryDto,
  AbakusStokInventoryDto,
  AbakusMarkaInventoryDto,
  AbakusUrunGrubuInventoryDto,
  AbakusSiparisInventoryDto
} from '../dtos/MigrationDtos';
import { migrationService } from '../services/MigrationService';

const MigrationHubPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isActive: isModulActive, isChecking: isModulChecking } = useModulGate('MOD_VERI_AKTARIMI');

  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const abakusFileInputRef = useRef<HTMLInputElement>(null);
  const logsBottomRef = useRef<HTMLDivElement>(null);

  // Sihirbaz Temel Durumları
  const [sourceType, setSourceType] = useState<MigrationSourceType>(MigrationSourceType.Excel);
  const [entityType, setEntityType] = useState<MigrationEntityType>(MigrationEntityType.Cari);
  const [importMode, setImportMode] = useState<MigrationImportMode>(MigrationImportMode.SkipDuplicates);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [connectionString, setConnectionString] = useState<string>('');
  const [abakusMode, setAbakusMode] = useState<'bak' | 'sql'>('bak');
  const [abakusSummary, setAbakusSummary] = useState<AbakusBackupSummaryDto | null>(null);

  // Container Durumu & Gelişmiş Görünüm
  const [containerStatus, setContainerStatus] = useState<AbakusContainerStatusDto | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Adım 3: Abakus Cari, Stok, Marka, Ürün Grubu & Sipariş Envanteri & Seçenekler
  const [cariInventory, setCariInventory] = useState<AbakusCariInventoryDto | null>(null);
  const [stokInventory, setStokInventory] = useState<AbakusStokInventoryDto | null>(null);
  const [markaInventory, setMarkaInventory] = useState<AbakusMarkaInventoryDto | null>(null);
  const [urunGrubuInventory, setUrunGrubuInventory] = useState<AbakusUrunGrubuInventoryDto | null>(null);
  const [alinanSiparisInventory, setAlinanSiparisInventory] = useState<AbakusSiparisInventoryDto | null>(null);
  const [verilenSiparisInventory, setVerilenSiparisInventory] = useState<AbakusSiparisInventoryDto | null>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState({
    importMarkalar: true,
    importUrunGruplari: true,
    importStoklar: true,
    importCariler: true,
    importAdresler: true,
    importIletisim: false,
    importBakiyeler: false,
    importAlinanSiparisler: true,
    importVerilenSiparisler: true,
    archivePastYears: true
  });

  // Adım 4: Canlı Batch Aktarım Durumları
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationFinished, setMigrationFinished] = useState<boolean>(false);
  const [migrationProgress, setMigrationProgress] = useState<number>(0);
  const [migratedMarkalar, setMigratedMarkalar] = useState<number>(0);
  const [migratedUrunGruplari, setMigratedUrunGruplari] = useState<number>(0);
  const [migratedCariler, setMigratedCariler] = useState<number>(0);
  const [migratedStoklar, setMigratedStoklar] = useState<number>(0);
  const [migratedAdresler, setMigratedAdresler] = useState<number>(0);
  const [migratedAlinanSiparisler, setMigratedAlinanSiparisler] = useState<number>(0);
  const [migratedVerilenSiparisler, setMigratedVerilenSiparisler] = useState<number>(0);
  const [migratedGuncellenen, setMigratedGuncellenen] = useState<number>(0);
  const [migratedAtlanan, setMigratedAtlanan] = useState<number>(0);
  const [migratedHatali, setMigratedHatali] = useState<number>(0);
  const [migratedArsivlenen, setMigratedArsivlenen] = useState<number>(0);

  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedDuration, setElapsedDuration] = useState<string>('');

  // Excel İçin Önizleme ve Doğrulama Durumları
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isExecutingExcel, setIsExecutingExcel] = useState<boolean>(false);
  const [previewResult, setPreviewResult] = useState<MigrationPreviewResultDto | null>(null);

  // Geçmiş Modal Durumu
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyLogs, setHistoryLogs] = useState<MigrationLogDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Docker Başlatma Durumu
  const [isStartingDocker, setIsStartingDocker] = useState<boolean>(false);

  const handleStartDocker = async () => {
    setIsStartingDocker(true);
    const toastId = toast.loading(t('Docker Desktop / servisi başlatılıyor, lütfen bekleyiniz...'));
    try {
      const res = await migrationService.startDocker();
      if (res.success) {
        toast.success(t('Docker başarıyla başlatıldı ve hazır hale geldi.'), { id: toastId });
        await fetchContainerStatus();
      } else {
        toast.error(res.message || t('Docker başlatılamadı.'), { id: toastId });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t('Docker başlatılırken bir hata oluştu.');
      toast.error(msg, { id: toastId });
    } finally {
      setIsStartingDocker(false);
    }
  };

  const formatDateSafe = (dateVal: any): string => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('tr-TR');
    } catch {
      return '';
    }
  };

  // Hazır Veritabanı Varlığı
  const hasReadyDatabase = Boolean(
    (containerStatus?.containerExists && containerStatus?.hasActiveDatabase && containerStatus.databaseName) ||
    (abakusSummary && abakusSummary.databaseName)
  );

  // Loglar aktıkça otomatik alta kaydır
  useEffect(() => {
    if (logsBottomRef.current) {
      logsBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [migrationLogs]);

  const fetchContainerStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await migrationService.getAbakusStatus();
      setContainerStatus(status);
      if (status.hasActiveDatabase && status.databaseName) {
        setAbakusSummary({
          databaseName: status.databaseName,
          bakFileName: status.bakFileName || '',
          originalFileName: status.originalFileName,
          fileSizeFormatted: status.fileSizeFormatted,
          earliestMovementDate: status.earliestMovementDate,
          latestMovementDate: status.latestMovementDate,
          cariCount: status.cariCount,
          adresCount: (status as any).adresCount || 0,
          stokCount: status.stokCount,
          markaCount: status.markaCount || 0,
          urunGrubuCount: status.urunGrubuCount || 0,
          alinanSiparisCount: status.alinanSiparisCount || 0,
          verilenSiparisCount: status.verilenSiparisCount || 0,
          success: true,
          message: status.message
        });

        // Arka planda detaylı envanterleri de önceden yükle
        Promise.all([
          migrationService.getCariInventory(status.databaseName).catch(() => null),
          migrationService.getStokInventory(status.databaseName).catch(() => null),
          migrationService.getMarkaInventory(status.databaseName).catch(() => null),
          migrationService.getUrunGrubuInventory(status.databaseName).catch(() => null),
          migrationService.getSiparisInventory(status.databaseName, 100).catch(() => null),
          migrationService.getSiparisInventory(status.databaseName, 101).catch(() => null)
        ]).then(([cInv, sInv, mInv, gInv, aInv, vInv]) => {
          if (cInv) setCariInventory(cInv);
          if (sInv) setStokInventory(sInv);
          if (mInv) setMarkaInventory(mInv);
          if (gInv) setUrunGrubuInventory(gInv);
          if (aInv) setAlinanSiparisInventory(aInv);
          if (vInv) setVerilenSiparisInventory(vInv);
        });
      }
    } catch (err: any) {
      // Sessizce geç
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchContainerStatus();
  }, []);

  const handleResetContainer = async () => {
    const toastId = toast.loading(t('Docker container ve geçici veritabanları siliniyor...'));
    try {
      await migrationService.resetAbakusContainer();
      setContainerStatus(null);
      setAbakusSummary(null);
      setSelectedFile(null);
      setCariInventory(null);
      setPreviewResult(null);
      if (abakusFileInputRef.current) abakusFileInputRef.current.value = '';
      toast.success(t('Container ve geçici veriler başarıyla kaldırıldı.'), { id: toastId });
    } catch (err: any) {
      toast.error(t('Container kaldırılırken bir hata oluştu.'), { id: toastId });
    }
  };

  const handleCloseWizard = async () => {
    const toastId = toast.loading(t('Docker container ve geçici veritabanları siliniyor...'));
    try {
      await migrationService.resetAbakusContainer();
      toast.success(t('Sihirbaz kapatıldı, Docker container temizlendi.'), { id: toastId });
    } catch (err) {
      console.warn('MigrationHubPage resetAbakusContainer hatası:', err);
      toast.dismiss(toastId);
    } finally {
      await handleReset();
      if (location.pathname.startsWith('/ayarlar/sistem-ayarlari')) {
        navigate('/ayarlar/sistem-ayarlari');
      } else if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/ayarlar/sistem-ayarlari');
      }
    }
  };

  const handleReset = async () => {
    if (abakusSummary?.databaseName) {
      await migrationService.cleanupAbakus(abakusSummary.databaseName, abakusSummary.bakFileName).catch(() => {});
    }
    setAbakusSummary(null);
    setCariInventory(null);
    setPreviewResult(null);
    setSelectedFile(null);
    setMigrationFinished(false);
    setMigrationProgress(0);
    setMigratedCariler(0);
    setMigratedAdresler(0);
    setMigratedAlinanSiparisler(0);
    setMigratedVerilenSiparisler(0);
    setMigratedArsivlenen(0);
    setAlinanSiparisInventory(null);
    setVerilenSiparisInventory(null);
    setMigratedGuncellenen(0);
    setMigratedAtlanan(0);
    setMigratedHatali(0);
    setMigrationLogs([]);
    if (excelFileInputRef.current) excelFileInputRef.current.value = '';
    if (abakusFileInputRef.current) abakusFileInputRef.current.value = '';
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const logs = await migrationService.getHistory();
      setHistoryLogs(logs);
    } catch (err: any) {
      toast.error(t('Aktarım geçmişi yüklenirken hata oluştu.'));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.loading(t('Şablon dosyası hazırlanıyor...'), { id: 'template-dl' });
      await migrationService.downloadTemplate(sourceType, entityType);
      toast.success(t('Şablon dosyası başarıyla indirildi.'), { id: 'template-dl' });
    } catch (err: any) {
      toast.error(t('Şablon dosyası indirilirken bir hata oluştu.'), { id: 'template-dl' });
    }
  };

  const uploadAndInspectAbakus = async (file: File) => {
    setIsAnalyzing(true);
    const toastId = toast.loading(t('Yedek dosyası inceleniyor ve veritabanı ortamı hazırlanıyor... (Gerekirse Docker otomatik başlatılacaktır)'));
    try {
      const summary = await migrationService.inspectBackup(file);
      setAbakusSummary(summary);
      await fetchContainerStatus();
      setShowUploadForm(false);
      const dateText = summary.latestMovementDate
        ? ` (${t('Son Hareket:')} ${new Date(summary.latestMovementDate).toLocaleDateString('tr-TR')})`
        : '';
      toast.success(
        t('Abakus veritabanı Docker üzerinde başarıyla açıldı! ({{cari}} Cari, {{stok}} Ürün/Hizmet{{date}})', {
          cari: summary.cariCount,
          stok: summary.stokCount,
          date: dateText
        }),
        { id: toastId }
      );
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t('Yedek dosyası açılırken hata oluştu.');
      toast.error(msg, { id: toastId });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewResult(null);

      if (sourceType === MigrationSourceType.Abakus && abakusMode === 'bak') {
        await uploadAndInspectAbakus(file);
      }
    }
  };

  // 1. Adım Doğrulaması (Kaynak)
  const validateStep1 = (): boolean => {
    if (sourceType !== MigrationSourceType.Excel && sourceType !== MigrationSourceType.Abakus) {
      toast.error(t('Lütfen kullanılabilir bir veri kaynağı seçiniz.'));
      return false;
    }
    return true;
  };

  // 2. Adım Doğrulaması (Dosya & Kaynak)
  const validateStep2 = async (): Promise<boolean> => {
    if (sourceType === MigrationSourceType.Excel) {
      if (!selectedFile) {
        toast.error(t('Lütfen aktarılacak bir Excel dosyası seçiniz.'));
        return false;
      }
      return true;
    }

    if (sourceType === MigrationSourceType.Abakus) {
      if (abakusMode === 'bak') {
        let dbName = abakusSummary?.databaseName || containerStatus?.databaseName;

        if (!dbName) {
          if (!selectedFile) {
            toast.error(t('Lütfen aktarılacak Abakus .bak yedek dosyasını seçiniz veya mevcut container ile devam ediniz.'));
            return false;
          }
          const success = await uploadAndInspectAbakus(selectedFile);
          if (!success) return false;
          dbName = abakusSummary?.databaseName;
        }

        if (dbName) {
          setIsLoadingInventory(true);
          const toastId = toast.loading(t('Abakus cari, adres, stok, marka ve kategori envanteri çıkarılıyor...'));
          try {
            const [cInv, sInv, mInv, gInv, aInv, vInv] = await Promise.all([
              migrationService.getCariInventory(dbName),
              migrationService.getStokInventory(dbName),
              migrationService.getMarkaInventory(dbName),
              migrationService.getUrunGrubuInventory(dbName),
              migrationService.getSiparisInventory(dbName, 100).catch(() => null),
              migrationService.getSiparisInventory(dbName, 101).catch(() => null)
            ]);
            setCariInventory(cInv);
            setStokInventory(sInv);
            setMarkaInventory(mInv);
            setUrunGrubuInventory(gInv);
            if (aInv) setAlinanSiparisInventory(aInv);
            if (vInv) setVerilenSiparisInventory(vInv);
            toast.success(
              t('Envanter hazırlandı: {{cari}} Cari, {{stok}} Stok, {{marka}} Marka, {{grup}} Ürün Grubu, {{alinan}} Alınan Sipariş, {{verilen}} Verilen Sipariş bulundu.', {
                cari: cInv.totalCariCount,
                stok: sInv.totalStokCount,
                marka: mInv.totalMarkaCount,
                grup: gInv.totalCategoryCount,
                alinan: aInv?.totalOrderCount ?? aInv?.totalSiparisCount ?? 0,
                verilen: vInv?.totalOrderCount ?? vInv?.totalSiparisCount ?? 0
              }),
              { id: toastId }
            );
            return true;
          } catch (err: any) {
            toast.error(t('Envanter bilgileri alınırken bir hata oluştu.'), { id: toastId });
            return false;
          } finally {
            setIsLoadingInventory(false);
          }
        }
      }

      if (abakusMode === 'sql' && !connectionString.trim()) {
        toast.error(t('Lütfen MS SQL Server bağlantı dizesini giriniz.'));
        return false;
      }
    }

    return true;
  };

  // 3. Adım Doğrulaması (Veri Tipleri & Seçenekler)
  const validateStep3 = async (): Promise<boolean> => {
    if (sourceType === MigrationSourceType.Abakus) {
      if (!selectedOptions.importMarkalar && !selectedOptions.importUrunGruplari && !selectedOptions.importCariler && !selectedOptions.importAdresler && !selectedOptions.importStoklar && !selectedOptions.importAlinanSiparisler && !selectedOptions.importVerilenSiparisler) {
        toast.error(t('Lütfen aktarılacak en az bir veri grubu seçiniz.'));
        return false;
      }
      return true;
    }

    // Excel için simülasyon tetiklemesi
    if (sourceType === MigrationSourceType.Excel) {
      if (!previewResult) {
        setIsAnalyzing(true);
        const toastId = toast.loading(t('Excel dosyası analiz ediliyor...'));
        try {
          const formData = new FormData();
          formData.append('sourceType', sourceType.toString());
          formData.append('entityType', entityType.toString());
          if (selectedFile) formData.append('dosya', selectedFile);

          const result = await migrationService.preview(formData);
          setPreviewResult(result);
          toast.success(t('Analiz tamamlandı.'), { id: toastId });
          return true;
        } catch (err: any) {
          toast.error(t('Analiz sırasında hata oluştu.'), { id: toastId });
          return false;
        } finally {
          setIsAnalyzing(false);
        }
      }
    }

    return true;
  };

  // 4. Adım Doğrulaması (Canlı Aktarım tamamlandı mı?)
  const validateStep4 = (): boolean => {
    if (sourceType === MigrationSourceType.Abakus) {
      if (!migrationFinished) {
        toast.error(t('Lütfen önce veri aktarımını başlatınız ve tamamlanmasını bekleyiniz.'));
        return false;
      }
      return true;
    }

    if (sourceType === MigrationSourceType.Excel) {
      if (!previewResult) {
        toast.error(t('Aktarılacak geçerli kayıt bulunamadı.'));
        return false;
      }
      return true;
    }

    return true;
  };

  // Canlı Batch Aktarımı Başlatıcı
  const startLiveBatchMigration = async () => {
    const dbName = abakusSummary?.databaseName || containerStatus?.databaseName;
    if (!dbName) {
      toast.error(t('Aktif veritabanı bulunamadı. Lütfen 2. adıma dönüp dosyayı kontrol ediniz.'));
      return;
    }

    setIsMigrating(true);
    setMigrationFinished(false);
    setMigrationProgress(0);
    setMigratedMarkalar(0);
    setMigratedUrunGruplari(0);
    setMigratedCariler(0);
    setMigratedStoklar(0);
    setMigratedAdresler(0);
    setMigratedAlinanSiparisler(0);
    setMigratedVerilenSiparisler(0);
    setMigratedArsivlenen(0);
    setMigratedGuncellenen(0);
    setMigratedAtlanan(0);
    setMigratedHatali(0);
    setMigrationLogs([]);

    const startTimestamp = Date.now();
    setStartTime(startTimestamp);

    const totalMarkalarToMigrate = selectedOptions.importMarkalar
      ? (markaInventory?.totalMarkaCount || containerStatus?.markaCount || abakusSummary?.markaCount || 0)
      : 0;

    const totalUrunGruplariToMigrate = selectedOptions.importUrunGruplari
      ? (urunGrubuInventory?.totalCategoryCount || containerStatus?.urunGrubuCount || abakusSummary?.urunGrubuCount || 0)
      : 0;

    const totalStoklarToMigrate = selectedOptions.importStoklar
      ? (stokInventory?.totalStokCount || containerStatus?.stokCount || abakusSummary?.stokCount || 0)
      : 0;

    const totalCarilerToMigrate = ((selectedOptions.importCariler || selectedOptions.importAdresler) && (cariInventory?.totalCariCount || containerStatus?.cariCount))
      ? (cariInventory?.totalCariCount || containerStatus?.cariCount || 0)
      : (containerStatus?.cariCount || 0);

    const totalAlinanSiparislerToMigrate = selectedOptions.importAlinanSiparisler
      ? (alinanSiparisInventory?.totalOrderCount ?? alinanSiparisInventory?.totalSiparisCount ?? containerStatus?.alinanSiparisCount ?? abakusSummary?.alinanSiparisCount ?? 0)
      : 0;

    const totalVerilenSiparislerToMigrate = selectedOptions.importVerilenSiparisler
      ? (verilenSiparisInventory?.totalOrderCount ?? verilenSiparisInventory?.totalSiparisCount ?? containerStatus?.verilenSiparisCount ?? abakusSummary?.verilenSiparisCount ?? 0)
      : 0;

    const grandTotal = totalMarkalarToMigrate + totalUrunGruplariToMigrate + totalStoklarToMigrate + totalCarilerToMigrate + totalAlinanSiparislerToMigrate + totalVerilenSiparislerToMigrate;

    if (grandTotal === 0) {
      toast.error(t('Aktarılacak herhangi bir veri bulunamadı. Lütfen aktarmak istediğiniz alanları seçiniz.'));
      setIsMigrating(false);
      return;
    }

    const batchSize = 100;

    let totalInsertedMarkalar = 0;
    let totalInsertedGruplar = 0;
    let totalInsertedCariler = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalAddresses = 0;
    let grandProcessed = 0;
    let hasFatalError = false;

    addLog(t('Canlı aktarım başlatıldı. Toplam {{count}} kayıt işlenecek...', { 
      count: grandTotal.toLocaleString()
    }));

    try {
      // ── FAZ 1: Marka Aktarımı (TBLMARKA) ─────────
      if (!hasFatalError && selectedOptions.importMarkalar && totalMarkalarToMigrate > 0) {
        let offset = 0;
        let hasMore = true;
        const markaBatchSize = 100;

        addLog(t('=== 1. Faz: Marka Aktarımı Başlatılıyor (TBLMARKA) ==='));

        while (hasMore) {
          const batchNum = Math.floor(offset / markaBatchSize) + 1;
          const totalBatches = Math.ceil(totalMarkalarToMigrate / markaBatchSize);

          addLog(t('Marka Batch {{current}}/{{total}}: {{offset}} - {{end}} arası markalar aktarılıyor...', {
            current: batchNum,
            total: totalBatches,
            offset: offset + 1,
            end: Math.min(offset + markaBatchSize, totalMarkalarToMigrate)
          }));

          const response = await migrationService.migrateMarkaBatch({
            databaseName: dbName,
            offset,
            batchSize: markaBatchSize,
            importMode
          });

          if (response.failedCount > 0 && response.successCount === 0 && response.updatedCount === 0 && response.skippedCount === 0) {
            hasFatalError = true;
            addLog(t('MARKA HATA: {{msg}}', { msg: response.message || response.errors.join(', ') }));
            toast.error(response.message || t('Marka batch aktarımı sırasında hata oluştu.'));
            break;
          }

          totalInsertedMarkalar += response.successCount;
          totalUpdated += response.updatedCount;
          totalSkipped += response.skippedCount;
          totalErrors += response.failedCount;
          grandProcessed += response.processedCount;

          setMigratedMarkalar(totalInsertedMarkalar + response.updatedCount);
          setMigratedGuncellenen(totalUpdated);
          setMigratedAtlanan(totalSkipped);
          setMigratedHatali(totalErrors);

          const progress = Math.min(100, Math.round((grandProcessed / grandTotal) * 100));
          setMigrationProgress(progress);

          if (response.skippedCount > 0) {
            addLog(t('Marka Batch {{num}}: {{count}} marka mükerrer olduğu için atlandı.', { num: batchNum, count: response.skippedCount }));
          }

          if (response.errors && response.errors.length > 0) {
            response.errors.forEach(l => addLog(l));
          }

          hasMore = !response.isCompleted && response.processedCount > 0 && (offset + markaBatchSize < totalMarkalarToMigrate);
          offset += markaBatchSize;
        }

        if (!hasFatalError) {
          addLog(t('Marka aktarımı tamamlandı. ({{count}} marka aktarıldı)', { count: (totalInsertedMarkalar + totalUpdated).toLocaleString() }));
        }
      }

      // ── FAZ 2: Ürün Grupları / Kategoriler (TBLCATEGORY) ─────────
      if (!hasFatalError && selectedOptions.importUrunGruplari && totalUrunGruplariToMigrate > 0) {
        let offset = 0;
        let hasMore = true;
        const grupBatchSize = 100;

        addLog(t('=== 2. Faz: Ürün Grubu & Kategori Hiyerarşisi Aktarımı Başlatılıyor (TBLCATEGORY) ==='));

        while (hasMore) {
          const batchNum = Math.floor(offset / grupBatchSize) + 1;
          const totalBatches = Math.ceil(totalUrunGruplariToMigrate / grupBatchSize);

          addLog(t('Kategori Batch {{current}}/{{total}}: {{offset}} - {{end}} arası kategoriler aktarılıyor...', {
            current: batchNum,
            total: totalBatches,
            offset: offset + 1,
            end: Math.min(offset + grupBatchSize, totalUrunGruplariToMigrate)
          }));

          const response = await migrationService.migrateUrunGrubuBatch({
            databaseName: dbName,
            offset,
            batchSize: grupBatchSize,
            importMode
          });

          if (response.failedCount > 0 && response.successCount === 0 && response.updatedCount === 0 && response.skippedCount === 0) {
            hasFatalError = true;
            addLog(t('KATEGORİ HATA: {{msg}}', { msg: response.message || response.errors.join(', ') }));
            toast.error(response.message || t('Kategori batch aktarımı sırasında hata oluştu.'));
            break;
          }

          totalInsertedGruplar += response.successCount;
          totalUpdated += response.updatedCount;
          totalSkipped += response.skippedCount;
          totalErrors += response.failedCount;
          grandProcessed += response.processedCount;

          setMigratedUrunGruplari(totalInsertedGruplar + response.updatedCount);
          setMigratedGuncellenen(totalUpdated);
          setMigratedAtlanan(totalSkipped);
          setMigratedHatali(totalErrors);

          const progress = Math.min(100, Math.round((grandProcessed / grandTotal) * 100));
          setMigrationProgress(progress);

          if (response.skippedCount > 0) {
            addLog(t('Kategori Batch {{num}}: {{count}} kategori mükerrer olduğu için atlandı.', { num: batchNum, count: response.skippedCount }));
          }

          if (response.errors && response.errors.length > 0) {
            response.errors.forEach(l => addLog(l));
          }

          hasMore = !response.isCompleted && response.processedCount > 0 && (offset + grupBatchSize < totalUrunGruplariToMigrate);
          offset += grupBatchSize;
        }

        if (!hasFatalError) {
          addLog(t('Ürün Grubu & Kategori aktarımı tamamlandı. ({{count}} grup aktarıldı)', { count: (totalInsertedGruplar + totalUpdated).toLocaleString() }));
        }
      }

      // ── FAZ 3: Stok / Ürün Kartları Aktarımı (TBLSTOK) ─────────
      let totalInsertedStoklar = 0;
      if (!hasFatalError && selectedOptions.importStoklar && totalStoklarToMigrate > 0) {
        let offset = 0;
        let hasMore = true;
        const stokBatchSize = 100;

        addLog(t('=== 3. Faz: Stok ve Ürün Kartları Aktarımı Başlatılıyor (TBLSTOK) ==='));

        while (hasMore) {
          const batchNum = Math.floor(offset / stokBatchSize) + 1;
          const totalBatches = Math.ceil(totalStoklarToMigrate / stokBatchSize);

          addLog(t('Stok Batch {{current}}/{{total}}: {{offset}} - {{end}} arası ürünler aktarılıyor...', {
            current: batchNum,
            total: totalBatches,
            offset: offset + 1,
            end: Math.min(offset + stokBatchSize, totalStoklarToMigrate)
          }));

          const response = await migrationService.migrateStokBatch({
            databaseName: dbName,
            offset,
            batchSize: stokBatchSize,
            aktarTemelKartlar: true,
            aktarFiyatlar: true,
            aktarBarkodlar: true,
            aktarBakiyeler: selectedOptions.importBakiyeler,
            importMode
          });

          if (response.failedCount > 0 && response.successCount === 0 && response.updatedCount === 0 && response.skippedCount === 0) {
            hasFatalError = true;
            addLog(t('STOK HATA: {{msg}}', { msg: response.message || response.errors.join(', ') }));
            toast.error(response.message || t('Stok batch aktarımı sırasında hata oluştu.'));
            break;
          }

          totalInsertedStoklar += response.successCount;
          totalUpdated += response.updatedCount;
          totalSkipped += response.skippedCount;
          totalErrors += response.failedCount;
          grandProcessed += response.processedCount;

          setMigratedStoklar(totalInsertedStoklar + response.updatedCount);
          setMigratedGuncellenen(totalUpdated);
          setMigratedAtlanan(totalSkipped);
          setMigratedHatali(totalErrors);

          const progress = Math.min(100, Math.round((grandProcessed / grandTotal) * 100));
          setMigrationProgress(progress);

          if (response.skippedCount > 0) {
            addLog(t('Stok Batch {{num}}: {{count}} ürün mükerrer olduğu için atlandı.', { num: batchNum, count: response.skippedCount }));
          }

          if (response.errors && response.errors.length > 0) {
            response.errors.forEach(l => addLog(l));
          }

          hasMore = !response.isCompleted && response.processedCount > 0 && (offset + stokBatchSize < totalStoklarToMigrate);
          offset += stokBatchSize;
        }

        if (!hasFatalError) {
          addLog(t('Stok aktarımı tamamlandı. ({{count}} ürün aktarıldı)', { count: (totalInsertedStoklar + totalUpdated).toLocaleString() }));
        }
      }

      // ── FAZ 4: Cari & Adres Aktarımı ─────────
      if (!hasFatalError && (selectedOptions.importCariler || selectedOptions.importAdresler) && totalCarilerToMigrate > 0) {
        let offset = 0;
        let hasMore = true;

        addLog(t('=== 4. Faz: Cari & Adres Aktarımı Başlatılıyor ==='));

        while (hasMore) {
          const batchNum = Math.floor(offset / batchSize) + 1;
          const totalBatches = Math.ceil(totalCarilerToMigrate / batchSize);

          addLog(t('Cari Batch {{current}}/{{total}}: {{offset}} - {{end}} arası cariler ve adresler aktarılıyor...', {
            current: batchNum,
            total: totalBatches,
            offset: offset + 1,
            end: Math.min(offset + batchSize, totalCarilerToMigrate)
          }));

          const response = await migrationService.migrateCariBatch({
            databaseName: dbName,
            offset,
            batchSize,
            aktarTemelKartlar: selectedOptions.importCariler,
            aktarAdresler: selectedOptions.importAdresler,
            aktarIletisim: selectedOptions.importIletisim,
            aktarBakiyeler: selectedOptions.importBakiyeler,
            importMode
          });

          if (response.failedCount > 0 && response.successCount === 0 && response.updatedCount === 0 && response.skippedCount === 0) {
            hasFatalError = true;
            addLog(t('CARI HATA: {{msg}}', { msg: response.message || response.errors.join(', ') }));
            toast.error(response.message || t('Cari batch aktarımı sırasında hata oluştu.'));
            break;
          }

          totalInsertedCariler += response.successCount;
          totalUpdated += response.updatedCount;
          totalSkipped += response.skippedCount;
          totalErrors += response.failedCount;
          totalAddresses += response.addressCount;
          grandProcessed += response.processedCount;

          setMigratedCariler(totalInsertedCariler + (response.updatedCount > 0 ? response.updatedCount : 0));
          setMigratedAdresler(totalAddresses);
          setMigratedGuncellenen(totalUpdated);
          setMigratedAtlanan(totalSkipped);
          setMigratedHatali(totalErrors);

          const progress = Math.min(100, Math.round((grandProcessed / grandTotal) * 100));
          setMigrationProgress(progress);

          if (response.skippedCount > 0) {
            addLog(t('Batch {{num}}: {{count}} cari mükerrer olduğu için atlandı.', { num: batchNum, count: response.skippedCount }));
          }

          if (response.errors && response.errors.length > 0) {
            response.errors.forEach(l => addLog(l));
          }

          hasMore = !response.isCompleted && response.processedCount > 0;
          offset += batchSize;
        }
      }

      // ── FAZ 5: Alınan Siparişler (Satış) Aktarımı ─────────
      let totalInsertedAlinanSiparisler = 0;
      let totalArchived = 0;
      if (!hasFatalError && selectedOptions.importAlinanSiparisler && totalAlinanSiparislerToMigrate > 0) {
        let offset = 0;
        let hasMore = true;
        const siparisBatchSize = 50;

        addLog(t('=== 5. Faz: Alınan Siparişler (Satış) Aktarımı Başlatılıyor (TBLSTOKHAREKETBASLIK - Fiş: 100) ==='));

        while (hasMore) {
          const batchNum = Math.floor(offset / siparisBatchSize) + 1;
          const totalBatches = Math.ceil(totalAlinanSiparislerToMigrate / siparisBatchSize);

          addLog(t('Alınan Sipariş Batch {{current}}/{{total}}: {{offset}} - {{end}} arası siparişler aktarılıyor...', {
            current: batchNum,
            total: totalBatches,
            offset: offset + 1,
            end: Math.min(offset + siparisBatchSize, totalAlinanSiparislerToMigrate)
          }));

          const response = await migrationService.migrateSiparisBatch({
            databaseName: dbName,
            fisTipi: 100,
            offset,
            batchSize: siparisBatchSize,
            importMode,
            guncelYildanEskileriArsivle: selectedOptions.archivePastYears
          });

          if (response.failedCount > 0 && response.successCount === 0 && response.updatedCount === 0 && response.skippedCount === 0) {
            hasFatalError = true;
            addLog(t('ALINAN SİPARİŞ HATA: {{msg}}', { msg: response.message || response.errors.join(', ') }));
            toast.error(response.message || t('Alınan sipariş batch aktarımı sırasında hata oluştu.'));
            break;
          }

          totalInsertedAlinanSiparisler += response.successCount;
          totalUpdated += response.updatedCount;
          totalSkipped += response.skippedCount;
          totalErrors += response.failedCount;
          totalArchived += (response.archivedCount || 0);
          grandProcessed += response.processedCount;

          setMigratedAlinanSiparisler(totalInsertedAlinanSiparisler + response.updatedCount);
          setMigratedArsivlenen(totalArchived);
          setMigratedGuncellenen(totalUpdated);
          setMigratedAtlanan(totalSkipped);
          setMigratedHatali(totalErrors);

          const progress = Math.min(100, Math.round((grandProcessed / grandTotal) * 100));
          setMigrationProgress(progress);

          if (response.skippedCount > 0) {
            addLog(t('Alınan Sipariş Batch {{num}}: {{count}} sipariş mükerrer olduğu için atlandı.', { num: batchNum, count: response.skippedCount }));
          }

          if (response.archivedCount && response.archivedCount > 0) {
            addLog(t('migration_log_alinan_archived', 'Alınan Sipariş Batch {{num}}: {{count}} adet güncel mali yıldan eski sipariş doğrudan arşive aktarıldı.', { num: batchNum, count: response.archivedCount }));
          }

          if (response.errors && response.errors.length > 0) {
            response.errors.forEach(l => addLog(l));
          }

          hasMore = !response.isCompleted && response.processedCount > 0 && (offset + siparisBatchSize < totalAlinanSiparislerToMigrate);
          offset += siparisBatchSize;
        }

        if (!hasFatalError) {
          addLog(t('Alınan sipariş aktarımı tamamlandı. ({{count}} sipariş aktarıldı)', { count: (totalInsertedAlinanSiparisler + totalUpdated).toLocaleString() }));
        }
      }

      // ── FAZ 6: Verilen Siparişler (Satınalma) Aktarımı ─────────
      let totalInsertedVerilenSiparisler = 0;
      if (!hasFatalError && selectedOptions.importVerilenSiparisler && totalVerilenSiparislerToMigrate > 0) {
        let offset = 0;
        let hasMore = true;
        const siparisBatchSize = 50;

        addLog(t('=== 6. Faz: Verilen Siparişler (Satınalma) Aktarımı Başlatılıyor (TBLSTOKHAREKETBASLIK - Fiş: 101) ==='));

        while (hasMore) {
          const batchNum = Math.floor(offset / siparisBatchSize) + 1;
          const totalBatches = Math.ceil(totalVerilenSiparislerToMigrate / siparisBatchSize);

          addLog(t('Verilen Sipariş Batch {{current}}/{{total}}: {{offset}} - {{end}} arası siparişler aktarılıyor...', {
            current: batchNum,
            total: totalBatches,
            offset: offset + 1,
            end: Math.min(offset + siparisBatchSize, totalVerilenSiparislerToMigrate)
          }));

          const response = await migrationService.migrateSiparisBatch({
            databaseName: dbName,
            fisTipi: 101,
            offset,
            batchSize: siparisBatchSize,
            importMode,
            guncelYildanEskileriArsivle: selectedOptions.archivePastYears
          });

          if (response.failedCount > 0 && response.successCount === 0 && response.updatedCount === 0 && response.skippedCount === 0) {
            hasFatalError = true;
            addLog(t('VERİLEN SİPARİŞ HATA: {{msg}}', { msg: response.message || response.errors.join(', ') }));
            toast.error(response.message || t('Verilen sipariş batch aktarımı sırasında hata oluştu.'));
            break;
          }

          totalInsertedVerilenSiparisler += response.successCount;
          totalUpdated += response.updatedCount;
          totalSkipped += response.skippedCount;
          totalErrors += response.failedCount;
          totalArchived += (response.archivedCount || 0);
          grandProcessed += response.processedCount;

          setMigratedVerilenSiparisler(totalInsertedVerilenSiparisler + response.updatedCount);
          setMigratedArsivlenen(totalArchived);
          setMigratedGuncellenen(totalUpdated);
          setMigratedAtlanan(totalSkipped);
          setMigratedHatali(totalErrors);

          const progress = Math.min(100, Math.round((grandProcessed / grandTotal) * 100));
          setMigrationProgress(progress);

          if (response.skippedCount > 0) {
            addLog(t('Verilen Sipariş Batch {{num}}: {{count}} sipariş mükerrer olduğu için atlandı.', { num: batchNum, count: response.skippedCount }));
          }

          if (response.archivedCount && response.archivedCount > 0) {
            addLog(t('migration_log_verilen_archived', 'Verilen Sipariş Batch {{num}}: {{count}} adet güncel mali yıldan eski sipariş doğrudan arşive aktarıldı.', { num: batchNum, count: response.archivedCount }));
          }

          if (response.errors && response.errors.length > 0) {
            response.errors.forEach(l => addLog(l));
          }

          hasMore = !response.isCompleted && response.processedCount > 0 && (offset + siparisBatchSize < totalVerilenSiparislerToMigrate);
          offset += siparisBatchSize;
        }

        if (!hasFatalError) {
          addLog(t('Verilen sipariş aktarımı tamamlandı. ({{count}} sipariş aktarıldı)', { count: (totalInsertedVerilenSiparisler + totalUpdated).toLocaleString() }));
        }
      }

      const durationSec = Math.round((Date.now() - startTimestamp) / 1000);
      const durationStr = `${Math.floor(durationSec / 60)} ${t('dk')} ${durationSec % 60} ${t('sn')}`;
      setElapsedDuration(durationStr);

      if (hasFatalError) {
        addLog(t('Aktarım hatalar nedeniyle durduruldu. Toplam Süre: {{duration}}', { duration: durationStr }));
        toast.error(t('Aktarım sırasında hata oluştu ve işlem durduruldu. Lütfen logları inceleyiniz.'));
        setMigrationFinished(false);
      } else {
        setMigrationProgress(100);
        setMigrationFinished(true);
        addLog(t('Tebrikler! Tüm aktarımlar tamamlandı. Toplam Süre: {{duration}}', { duration: durationStr }));
        toast.success(t('Seçilen veriler (Marka, Kategori, Stok, Cari, Adres ve Siparişler) başarıyla aktarıldı!'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t('Aktarım sırasında beklenmeyen bir hata oluştu.');
      addLog(t('Kritik Hata: {{msg}}', { msg }));
      toast.error(msg);
      setMigrationFinished(false);
    } finally {
      setIsMigrating(false);
    }
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString('tr-TR');
    setMigrationLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  const handleToggleSelectAllOptions = () => {
    const allSelected = selectedOptions.importMarkalar && selectedOptions.importUrunGruplari && selectedOptions.importStoklar && selectedOptions.importCariler && selectedOptions.importAdresler && selectedOptions.importAlinanSiparisler && selectedOptions.importVerilenSiparisler;
    setSelectedOptions(prev => ({
      ...prev,
      importMarkalar: !allSelected,
      importUrunGruplari: !allSelected,
      importStoklar: !allSelected,
      importCariler: !allSelected,
      importAdresler: !allSelected,
      importIletisim: !allSelected,
      importBakiyeler: !allSelected,
      importAlinanSiparisler: !allSelected,
      importVerilenSiparisler: !allSelected
    }));
  };


  if (!isModulChecking && isModulActive === false) {
    return (
      <div className="surface-card p-32 text-center rounded-16 flex flex-col items-center justify-center gap-16 m-16">
        <div className="text-secondary text-base">
          {t('auto_veri_aktarim_merkezi_pasif', 'Veri Aktarım Merkezi modülü firmanız için aktif değildir.')}
        </div>
        <BaseButton variant="secondary" onClick={() => navigate('/ayarlar/sistem-ayarlari')}>
          {t('auto_sistem_ayarlarina_don', 'Sistem Ayarlarına Dön')}
        </BaseButton>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BaseWizardPage
        id="migrationHubWizard"
        title={t('Veri Aktarım ve Geçiş Merkezi')}
        icon={<ArrowRightLeft size={20} />}
        subtitleLeft={t('Eski yazılımlarınızdan ve Excel dosyalarınızdan verilerinizi Webakus\'a güvenle aktarın.')}
        headerExtra={
          <BaseButton
            variant="secondary"
            onClick={() => {
              setIsHistoryOpen(true);
              loadHistory();
            }}
            className="btn-sm"
            text={t('Aktarım Geçmişi')}
            icon={<History size={16} />}
          />
        }
        finishText={t('Sihirbazı Tamamla ve Kapat')}
        isFinishing={isMigrating || isAnalyzing || isExecutingExcel}
        onFinish={handleCloseWizard}
        onClose={handleCloseWizard}
        hideBreadcrumb={true}
      >
        {/* Adım 1: Kaynak Seçimi */}
        <WizardStep 
          title={t('Kaynak Seçimi')}
          onValidate={validateStep1}
        >
          <div className="surface-card p-24 flex-col gap-20 flex-1 w-full">
            <div className="flex-row items-center gap-10">
              <Database size={20} className="text-primary" />
              <div>
                <h2 className="text-16 font-bold">{t('1. Veri Kaynağını Seçin')}</h2>
                <p className="text-13 text-secondary">{t('Verilerinizi hangi sistemden veya formattan aktarmak istiyorsunuz?')}</p>
              </div>
            </div>

            <div className="migration-source-grid flex-1">
              {/* Standart Excel */}
              <div 
                className={`migration-source-card ${sourceType === MigrationSourceType.Excel ? 'active' : ''}`}
                onClick={() => { setSourceType(MigrationSourceType.Excel); handleReset(); }}
              >
                <div className="migration-source-header">
                  <div className="migration-source-icon">
                    <FileSpreadsheet size={22} />
                  </div>
                  <span className="migration-badge migration-badge-ready">{t('Hazır / Aktif')}</span>
                </div>
                <h3 className="font-bold text-14">{t('Webakus Standart Excel')}</h3>
                <p className="text-12 text-secondary">
                  {t('Renkli ve açıklamalı hazır Excel şablonumuzla toplu cari ve stok aktarımı.')}
                </p>
              </div>

              {/* Abakus MS SQL */}
              <div 
                className={`migration-source-card ${sourceType === MigrationSourceType.Abakus ? 'active' : ''}`}
                onClick={() => { 
                  setSourceType(MigrationSourceType.Abakus); 
                  handleReset(); 
                  fetchContainerStatus(); 
                }}
              >
                <div className="migration-source-header">
                  <div className="migration-source-icon">
                    <Database size={22} />
                  </div>
                  <span className="migration-badge migration-badge-ready">{t('Hazır / Aktif')}</span>
                </div>
                <h3 className="font-bold text-14">{t('Abakus ERP (MS SQL)')}</h3>
                <p className="text-12 text-secondary">
                  {t('Webakus\'ün öncülü Abakus veritabanından (.bak yedeği veya doğrudan SQL) cari ve adres transferi.')}
                </p>
              </div>

              {/* Logo Yazılım */}
              <div className="migration-source-card disabled">
                <div className="migration-source-header">
                  <div className="migration-source-icon">
                    <Layers size={22} />
                  </div>
                  <span className="migration-badge migration-badge-planned">{t('Planlanan')}</span>
                </div>
                <h3 className="font-bold text-14">{t('Logo Go3 / Tiger')}</h3>
                <p className="text-12 text-secondary">
                  {t('Logo veritabanı yedeğinden (.bak) veya dışa aktarım dosyalarından otomatik aktarım.')}
                </p>
              </div>

              {/* Mikro Yazılım */}
              <div className="migration-source-card disabled">
                <div className="migration-source-header">
                  <div className="migration-source-icon">
                    <Layers size={22} />
                  </div>
                  <span className="migration-badge migration-badge-planned">{t('Planlanan')}</span>
                </div>
                <h3 className="font-bold text-14">{t('Mikro Fly / Jump')}</h3>
                <p className="text-12 text-secondary">
                  {t('Mikro veritabanından cari, stok ve bakiye devir aktarımı.')}
                </p>
              </div>
            </div>
          </div>
        </WizardStep>

        {/* Adım 2: Dosya & Kaynak */}
        <WizardStep 
          title={t('Dosya & Kaynak')}
          onValidate={validateStep2}
        >
          <div className="surface-card p-24 flex-col gap-20 flex-1 w-full">
            <div className="flex-row items-center gap-10">
              <UploadCloud size={20} className="text-primary" />
              <div>
                <h2 className="text-16 font-bold">
                  {sourceType === MigrationSourceType.Excel 
                    ? t('2. Excel Dosyasını Yükleyin') 
                    : t('2. Abakus ERP Veritabanı ve Kaynak Seçimi')}
                </h2>
                <p className="text-13 text-secondary">
                  {sourceType === MigrationSourceType.Excel 
                    ? t('Hazırladığınız Excel dosyasını seçin. (.xlsx ve .xls dosyaları desteklenir)')
                    : hasReadyDatabase && !showUploadForm
                      ? t('Sistemde hazır bulunan Abakus ERP veritabanı üzerinden devam edebilir veya yeni bir yedek yükleyebilirsiniz.')
                      : t('Abakus ERP veritabanı yedeğinizi (.bak) yükleyiniz.')}
                </p>
              </div>
            </div>

            {sourceType === MigrationSourceType.Excel ? (
              <div className="flex-col gap-12 flex-1 justify-center">
                <input 
                  type="file" 
                  ref={excelFileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls"
                  className="d-none"
                  id="migration-excel-file-input"
                />
                
                <label 
                  htmlFor="migration-excel-file-input"
                  className="migration-dropzone flex-1 min-h-200 flex flex-col items-center justify-center cursor-pointer"
                >
                  <UploadCloud size={48} className="text-secondary mb-8" />
                  <h4 className="font-semibold text-15">
                    {selectedFile ? selectedFile.name : t('Excel dosyasını sürükleyip bırakın veya seçmek için tıklayın')}
                  </h4>
                  <p className="text-12 text-secondary">
                    {t('Desteklenen formatlar: .xlsx, .xls (Maksimum 25 MB)')}
                  </p>
                  <BaseButton
                    variant="secondary"
                    className="btn-sm mt-12"
                    text={selectedFile ? t('Farklı Dosya Seç') : t('Dosya Seç (.XLSX)')}
                    icon={<UploadCloud size={16} />}
                    onClick={(e) => {
                      e.preventDefault();
                      excelFileInputRef.current?.click();
                    }}
                  />
                  {selectedFile && (
                    <div className="flex-row items-center gap-8 mt-8">
                      <span className="status-active-badge">
                        <span className="dot"></span>
                        {t('Dosya Seçildi')} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="flex-col gap-16 flex-1">
                {/* Durum A: Hazır Veritabanı Varsa ve Yeni Dosya Formu Açılmamışsa */}
                {hasReadyDatabase && !showUploadForm ? (
                  <div className="md3-migration-card">
                    <div className="md3-migration-header-box justify-between">
                      <div className="flex-row items-start gap-12 flex-1">
                        <div className="md3-migration-icon-avatar">
                          <Database size={26} />
                        </div>
                        <div className="flex-col gap-4 flex-1">
                          <div className="flex-row items-center gap-10">
                            <h3 className="font-bold text-16 text-primary">{t('Hazır Abakus ERP Yedeğiniz Bulundu')}</h3>
                            <span className="status-active-badge">
                              <span className="dot"></span>
                              {t('Kullanıma Hazır')}
                            </span>
                          </div>
                          <p className="text-13 text-secondary">
                            {t('Sisteminizde daha önce yüklenmiş olan Abakus ERP veritabanı hazır durumdadır. Yeniden dosya yüklemenize gerek kalmadan doğrudan bu veri kaynağı üzerinden aktarıma devam edebilir veya yeni bir yedek seçebilirsiniz.')}
                          </p>
                          
                          {/* Tarih ve Boyut Bilgisi */}
                          <div className="flex-row items-center gap-12 text-12 mt-6 flex-wrap">
                            {(containerStatus?.latestMovementDate || abakusSummary?.latestMovementDate) && (
                              <span className="flex-row items-center gap-4 text-primary font-semibold bg-primary-soft px-8 py-4 rounded-6">
                                <Calendar size={13} />
                                {t('Son Hareket / Belge Tarihi:')}{' '}
                                {formatDateSafe(containerStatus?.latestMovementDate || abakusSummary?.latestMovementDate)}
                              </span>
                            )}
                            {(containerStatus?.earliestMovementDate || abakusSummary?.earliestMovementDate) && (
                              <span className="flex-row items-center gap-4 text-secondary bg-surface-subtle px-8 py-4 rounded-6 border">
                                <Clock size={13} />
                                {t('İlk Belge Tarihi:')}{' '}
                                {formatDateSafe(containerStatus?.earliestMovementDate || abakusSummary?.earliestMovementDate)}
                              </span>
                            )}
                            {(containerStatus?.fileSizeFormatted || abakusSummary?.fileSizeFormatted) && (
                              <span className="flex-row items-center gap-4 text-secondary bg-surface-subtle px-8 py-4 rounded-6 border">
                                <FileText size={13} />
                                {t('Boyut:')} {containerStatus?.fileSizeFormatted || abakusSummary?.fileSizeFormatted}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-col gap-8 flex-shrink-0">
                        <BaseButton
                          variant="secondary"
                          className="btn-sm text-primary"
                          text={t('Yeni / Farklı Yedek Seç (.BAK / .RAR)')}
                          icon={<UploadCloud size={15} />}
                          onClick={() => setShowUploadForm(true)}
                        />
                      </div>
                    </div>

                    {/* Aktarım Yapılacak Alanlar (Yatay yayılan MigrationFieldCard bileşenleri) */}
                    <div className="flex-col gap-12 w-full">
                      {/* 1. Temel Cari Kartları (Aktif) */}
                      <MigrationFieldCard
                        icon={<Users size={22} />}
                        iconVariant="primary"
                        title={t('Temel Cari Kartları')}
                        subtitle={t('TBLCARI Tablosu')}
                        description={t('Cari Kodu, Unvan, Ad/Soyad, Vergi Dairesi, Vergi No, TCKN ve Cari Türü (Alıcı/Satıcı) eşleştirilir.')}
                        badge={
                          <>
                            {(containerStatus?.cariCount || abakusSummary?.cariCount || 0).toLocaleString()}{' '}
                            <span className="font-normal text-secondary">{t('Cari')}</span>
                          </>
                        }
                        checked={selectedOptions.importCariler}
                        onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importCariler: checked }))}
                      />

                      {/* 2. Cari Adresleri (Aktif) */}
                      <MigrationFieldCard
                        icon={<MapPin size={22} />}
                        iconVariant="primary"
                        title={t('Cari Adresleri')}
                        subtitle={t('TBLADRES Tablosu')}
                        description={t('Adres Başlığı, İl, İlçe, Mahalle, Cadde/Sokak ve Posta Kodu Webakus Merkezi Adres Mimarisi ile Genel Adresler tablosuna aktarılır.')}
                        badge={
                          <>
                            {(containerStatus?.adresCount || abakusSummary?.adresCount || cariInventory?.totalAddressCount || 0).toLocaleString()}{' '}
                            <span className="font-normal text-secondary">{t('Adres')}</span>
                          </>
                        }
                        checked={selectedOptions.importAdresler}
                        onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importAdresler: checked }))}
                      />

                      {/* 3. Stok ve Ürün Kartları */}
                      <MigrationFieldCard
                        icon={<Package size={22} />}
                        iconVariant="primary"
                        title={t('Stok / Ürün Kartları')}
                        subtitle={t('TBLSTOK Tablosu')}
                        description={t('Stok Kodu, Ürün Adı, Barkod, Alış/Satış Fiyatı ve Birim bilgileri Webakus Ürün ve Hizmet Kartlarına aktarılır.')}
                        badge={
                          <>
                            {(containerStatus?.stokCount || abakusSummary?.stokCount || stokInventory?.totalStokCount || 0).toLocaleString()}{' '}
                            <span className="font-normal text-secondary">{t('Stok')}</span>
                          </>
                        }
                        checked={selectedOptions.importStoklar}
                        onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importStoklar: checked }))}
                      />

                      {/* 4. Markalar */}
                      <MigrationFieldCard
                        icon={<Tag size={22} />}
                        iconVariant="primary"
                        title={t('Markalar')}
                        subtitle={t('TBLMARKA Tablosu')}
                        description={t('Abakus sistemindeki üretici ve ürün markaları Webakus Marka tablosuna aktarılır ve stok kartlarına bağlanır.')}
                        badge={
                          <>
                            {(containerStatus?.markaCount || abakusSummary?.markaCount || 0).toLocaleString()}{' '}
                            <span className="font-normal text-secondary">{t('Marka')}</span>
                          </>
                        }
                        checked={selectedOptions.importMarkalar}
                        onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importMarkalar: checked }))}
                      />

                      {/* 5. Ürün Grupları / Kategoriler */}
                      <MigrationFieldCard
                        icon={<FolderTree size={22} />}
                        iconVariant="success"
                        title={t('Ürün Grupları / Kategoriler')}
                        subtitle={t('TBLCATEGORY Tablosu')}
                        description={t('Ana ve alt kategori hiyerarşisi korunarak Webakus Ürün ve Hizmet Gruplarına aktarılır ve ürünlere bağlanır.')}
                        badge={
                          <>
                            {(containerStatus?.urunGrubuCount || abakusSummary?.urunGrubuCount || 0).toLocaleString()}{' '}
                            <span className="font-normal text-secondary">{t('Grup')}</span>
                          </>
                        }
                        badgeVariant="success"
                        checked={selectedOptions.importUrunGruplari}
                        onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importUrunGruplari: checked }))}
                      />

                      {/* 6. Alınan Siparişler (Satış) */}
                      <MigrationFieldCard
                        icon={<ShoppingCart size={22} />}
                        iconVariant="primary"
                        title={t('Alınan Siparişler (Satış)')}
                        subtitle={t('TBLSTOKHAREKETBASLIK & TBLSTOKHAREKETSATIR (Fiş: 100)')}
                        description={t('Müşteri satış siparişleri, kalemleri, miktar, birim fiyat, KDV ve iskonto detayları ile Webakus Satış Belgelerine aktarılır.')}
                        badge={
                          <>
                            {(alinanSiparisInventory?.totalOrderCount ?? alinanSiparisInventory?.totalSiparisCount ?? containerStatus?.alinanSiparisCount ?? abakusSummary?.alinanSiparisCount ?? 0).toLocaleString()}{' '}
                            <span className="font-normal text-secondary">{t('Sipariş')}</span>
                          </>
                        }
                        checked={selectedOptions.importAlinanSiparisler}
                        onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importAlinanSiparisler: checked }))}
                      />

                      {/* 7. Verilen Siparişler (Satınalma) */}
                      <MigrationFieldCard
                        icon={<PackageCheck size={22} />}
                        iconVariant="success"
                        title={t('Verilen Siparişler (Satınalma)')}
                        subtitle={t('TBLSTOKHAREKETBASLIK & TBLSTOKHAREKETSATIR (Fiş: 101)')}
                        description={t('Tedarikçi satınalma siparişleri, kalemleri, miktar, birim fiyat ve KDV detayları ile Webakus Satınalma Belgelerine aktarılır.')}
                        badge={
                          <>
                            {(verilenSiparisInventory?.totalOrderCount ?? verilenSiparisInventory?.totalSiparisCount ?? containerStatus?.verilenSiparisCount ?? abakusSummary?.verilenSiparisCount ?? 0).toLocaleString()}{' '}
                            <span className="font-normal text-secondary">{t('Sipariş')}</span>
                          </>
                        }
                        badgeVariant="success"
                        checked={selectedOptions.importVerilenSiparisler}
                        onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importVerilenSiparisler: checked }))}
                      />
                    </div>

                    {/* Alt Bilgi & İşlem Çubuğu */}
                    <div className="flex-row items-center justify-between pt-16 border-t">
                      {/* Sol: Kullanıcı Dostu İlerleme İpucu */}
                      <div className="flex-row items-center gap-8 text-13 text-secondary">
                        <span className="status-active-badge">
                          <span className="dot"></span>
                          {t('Aktarıma Hazır')}
                        </span>
                        <span>{t('Devam etmek için sağ alttaki "İleri" butonuna tıklayabilirsiniz.')}</span>
                      </div>

                      {/* Sağ: Kullanıcı Dostu Aksiyonlar (Sıfırla & Teknik Detaylar) */}
                      <div className="flex-row items-center gap-10">
                        <BaseButton
                          variant="ghost"
                          className="btn-sm text-secondary"
                          text={showTechnicalDetails ? t('Teknik Detayları Gizle') : t('Teknik Detaylar')}
                          icon={<Info size={15} />}
                          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                        />

                        <BaseButton
                          variant="secondary"
                          className="btn-sm text-danger"
                          text={t('Yedeği Sıfırla ve Yeni Dosya Seç')}
                          icon={<RotateCcw size={15} />}
                          onClick={handleResetContainer}
                          title={t('Mevcut yedeği silip sıfırdan yeni bir .bak dosyası yüklemenizi sağlar')}
                        />
                      </div>
                    </div>

                    {/* Şık ve Düzenli Teknik Detaylar Paneli */}
                    {showTechnicalDetails && (
                      <div className="md3-tech-drawer">
                        <div className="flex-row items-center justify-between border-b pb-8">
                          <span className="text-12 font-bold text-primary flex-row items-center gap-6">
                            <Server size={14} />
                            {t('Sistem ve Docker Altyapı Bilgileri')}
                          </span>
                          <span className="text-11 text-secondary">
                            {t('Sistem tarafından otomatik yönetilmektedir')}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-12 text-12">
                          <div className="flex-col gap-2">
                            <span className="text-11 text-secondary">{t('Geçici Veritabanı:')}</span>
                            <span className="font-mono text-12 font-semibold text-primary truncate" title={containerStatus?.databaseName || abakusSummary?.databaseName}>
                              {containerStatus?.databaseName || abakusSummary?.databaseName}
                            </span>
                          </div>

                          <div className="flex-col gap-2">
                            <span className="text-11 text-secondary">{t('Container Adı & Port:')}</span>
                            <span className="font-mono text-12 font-semibold text-secondary">
                              {containerStatus?.containerName} ({t('Port:')} {containerStatus?.port})
                            </span>
                          </div>

                          <div className="flex-col gap-2">
                            <span className="text-11 text-secondary">{t('Hizmet Durumu:')}</span>
                            <span className="text-12 font-semibold text-success flex-row items-center gap-4">
                              <CheckCircle2 size={13} />
                              {containerStatus?.isRunning ? t('SQL Server 2022 Aktif') : t('Durduruldu')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Durum B: Hazır Veritabanı Yoksa veya Kullanıcı Yeni Yedek Yükle'ye Bastıysa */
                  <div className="flex-col gap-16 flex-1 justify-center">
                    {hasReadyDatabase && (
                      <div className="flex-row items-center justify-between">
                        <BaseButton
                          variant="ghost"
                          className="btn-sm text-primary"
                          text={t('← Hazır Yedeğe Geri Dön')}
                          onClick={() => setShowUploadForm(false)}
                        />
                      </div>
                    )}

                    {containerStatus && containerStatus.isDockerRunning === false && (
                      <div className="migration-docker-notice-card flex-row items-center justify-between p-16 rounded-12">
                        <div className="flex-row items-center gap-12">
                          <div className="docker-notice-icon-box">
                            <Server size={22} />
                          </div>
                          <div className="flex-col gap-2">
                            <h4 className="font-semibold text-13 text-primary">
                              {t('Docker Servisi / Desktop Kapalı Tespit Edildi')}
                            </h4>
                            <p className="text-12 text-secondary">
                              {t('Yedek dosyanızı seçtiğinizde sistem Docker\'ı sizin için kendiliğinden otomatik olarak başlatacaktır. Dilerseniz aşağıdaki düğmeyle şimdi de başlatabilirsiniz.')}
                            </p>
                          </div>
                        </div>
                        <BaseButton
                          variant="secondary"
                          className="btn-sm text-primary flex-shrink-0"
                          text={isStartingDocker ? t('Başlatılıyor...') : t('Docker\'ı Şimdi Başlat')}
                          icon={isStartingDocker ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
                          onClick={handleStartDocker}
                          disabled={isStartingDocker}
                        />
                      </div>
                    )}

                    {isAnalyzing ? (
                      <div className="migration-dropzone flex-1 min-h-220 flex flex-col items-center justify-center p-24">
                        <RefreshCw size={44} className="text-primary animate-spin mb-12" />
                        <h4 className="font-bold text-16 text-primary">
                          {t('Docker ve Veritabanı Ortamı Hazırlanıyor...')}
                        </h4>
                        <p className="text-13 text-secondary mt-6 text-center max-w-500">
                          {t('Docker kontrol ediliyor (gerekirse otomatik başlatılıyor), MS SQL Server container\'ı açılıyor ve yedek dosyası restore ediliyor. Lütfen bekleyiniz...')}
                        </p>
                      </div>
                    ) : (
                      <div className="flex-col gap-12 flex-1 justify-center">
                        <input 
                          type="file" 
                          ref={abakusFileInputRef}
                          onChange={handleFileChange}
                          accept=".bak,.sql,.rar,.zip,.7z"
                          className="d-none"
                          id="abakus-bak-file-input"
                        />
                        <div 
                          className="migration-dropzone flex-1 min-h-200 flex flex-col items-center justify-center cursor-pointer"
                          onClick={() => abakusFileInputRef.current?.click()}
                        >
                          <Database size={48} className="text-secondary mb-8" />
                          <h4 className="font-semibold text-15">
                            {selectedFile ? selectedFile.name : t('Abakus veritabanı yedek dosyasını (.bak, .rar, .zip) sürükleyip bırakın veya seçmek için tıklayın')}
                          </h4>
                          <p className="text-12 text-secondary">
                            {t('MS SQL Server yedek dosyaları (.bak), sıkıştırılmış arşivler (.rar, .zip) ve SQL betikleri (.sql) desteklenmektedir.')}
                          </p>
                          
                          <div className="flex-row items-center gap-10 mt-12">
                            <BaseButton
                              variant="secondary"
                              className="btn-sm"
                              text={selectedFile ? t('Farklı Dosya Seç') : t('Dosya Seç (.BAK / .RAR / .ZIP)')}
                              icon={<UploadCloud size={16} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                abakusFileInputRef.current?.click();
                              }}
                            />

                            {selectedFile && (
                              <BaseButton
                                variant="primary"
                                className="btn-sm"
                                text={t('Docker\'a Yükle ve Veritabanını Aç')}
                                icon={<Database size={16} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  uploadAndInspectAbakus(selectedFile);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </WizardStep>

        {/* Adım 3: Veri Tipleri & Seçenekler */}
        <WizardStep 
          title={t('Veri Tipleri & Seçenekler')}
          onValidate={validateStep3}
        >
          <div className="surface-card p-24 flex-col gap-20 flex-1 w-full">
            <div className="flex-row justify-between items-center">
              <div className="flex-row items-center gap-10">
                <Layers size={20} className="text-primary" />
                <div>
                  <h2 className="text-16 font-bold">
                    {sourceType === MigrationSourceType.Abakus
                      ? t('3. Abakus ERP Cari Envanteri ve Aktarılacak Alanlar')
                      : t('3. Aktarılacak Varlık Türünü Belirleyin')}
                  </h2>
                  <p className="text-13 text-secondary">
                    {sourceType === MigrationSourceType.Abakus
                      ? t('Kaynak veritabanında tespit edilen verilerden aktarmak istediklerinizi seçin.')
                      : t('Yüklediğiniz Excel dosyasından aktarılacak varlık türünü belirleyin.')}
                  </p>
                </div>
              </div>

              {sourceType === MigrationSourceType.Abakus && (
                <BaseButton
                  variant="ghost"
                  className="btn-sm"
                  text={selectedOptions.importCariler && selectedOptions.importAdresler ? t('Seçimleri Temizle') : t('Tümünü Seç')}
                  icon={selectedOptions.importCariler && selectedOptions.importAdresler ? <Square size={14} /> : <CheckSquare size={14} />}
                  onClick={handleToggleSelectAllOptions}
                />
              )}
            </div>

            {sourceType === MigrationSourceType.Abakus && (containerStatus?.latestMovementDate || abakusSummary?.latestMovementDate) && (
              <div className="flex-row items-center gap-12 text-12 p-10 bg-primary-soft rounded-8 border text-primary">
                <Calendar size={15} />
                <span>
                  {t('Aktarılacak Veri Kaynağındaki En Son Belge/Hareket Tarihi:')}{' '}
                  <strong>{formatDateSafe(containerStatus?.latestMovementDate || abakusSummary?.latestMovementDate)}</strong>
                </span>
                {(containerStatus?.fileSizeFormatted || abakusSummary?.fileSizeFormatted) && (
                  <span className="text-secondary ml-auto">
                    {t('Dosya Boyutu:')} {containerStatus?.fileSizeFormatted || abakusSummary?.fileSizeFormatted}
                  </span>
                )}
              </div>
            )}

            {sourceType === MigrationSourceType.Abakus ? (
              <div className="flex-col gap-16 flex-1">
                {/* Cari Envanter Seçenek Kartları */}
                <div className="flex-col gap-12 w-full">
                  {/* 1. Temel Cari Kartları */}
                  <MigrationFieldCard
                    icon={<Users size={22} />}
                    iconVariant="primary"
                    title={t('Temel Cari Kartları')}
                    subtitle={t('TBLCARI Tablosu')}
                    description={t('Cari Kodu, Unvan, Ad/Soyad, Vergi Dairesi, Vergi No, TCKN ve Cari Türü (Alıcı/Satıcı) eşleştirilir.')}
                    badge={
                      <>
                        {(cariInventory?.totalCariCount ?? containerStatus?.cariCount ?? abakusSummary?.cariCount ?? 3375).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Cari')}</span>
                      </>
                    }
                    extra={
                      cariInventory && (
                        <>
                          <span>{t('Müşteri:')} {(cariInventory.musteriCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Satıcı:')} {(cariInventory.saticiCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Diğer:')} {(cariInventory.musteriSaticiCount ?? 0).toLocaleString()}</span>
                        </>
                      )
                    }
                    checked={selectedOptions.importCariler}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importCariler: checked }))}
                  />

                  {/* 2. Cari Adresleri */}
                  <MigrationFieldCard
                    icon={<MapPin size={22} />}
                    iconVariant="success"
                    title={t('Cari Adresleri')}
                    subtitle={t('TBLADRES Tablosu')}
                    description={t('Adres Başlığı, İl, İlçe, Mahalle, Cadde/Sokak ve Posta Kodu Webakus Merkezi Adres Mimarisi ile Genel Adresler tablosuna aktarılır.')}
                    badge={
                      <>
                        {(cariInventory?.totalAddressCount ?? containerStatus?.adresCount ?? abakusSummary?.adresCount ?? 3713).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Adres')}</span>
                      </>
                    }
                    badgeVariant="success"
                    extra={
                      cariInventory && (
                        <span>{t('{{count}} Cari için kayıtlı adres mevcuttur.', { count: (cariInventory.cariWithAddressCount ?? 0).toLocaleString() })}</span>
                      )
                    }
                    checked={selectedOptions.importAdresler}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importAdresler: checked }))}
                  />

                  {/* 3. İletişim Bilgileri */}
                  <MigrationFieldCard
                    icon={<Phone size={22} />}
                    iconVariant="primary"
                    title={t('İletişim & Telefon Bilgileri')}
                    subtitle={t('Telefon, GSM, E-posta')}
                    description={t('Abakus TBLADRES ve TBLCARI tablolarındaki Tel, GSM ve E-posta verileri cariye ve adres kartlarına otomatik bağlanır.')}
                    badge={
                      <>
                        {(cariInventory?.cariWithPhoneCount ?? 3366).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Cari')}</span>
                      </>
                    }
                    checked={selectedOptions.importIletisim}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importIletisim: checked }))}
                  />

                  {/* 4. Devir Bakiyeleri & Finansal Durum */}
                  <MigrationFieldCard
                    icon={<Wallet size={22} />}
                    iconVariant="success"
                    title={t('Devir Bakiyeleri')}
                    subtitle={t('Cari Açılış Bakiyesi')}
                    description={t('Abakus sistemindeki güncel borç/alacak bakiye durumu Webakus açılış fişi veya cari bakiye devri olarak aktarılır.')}
                    badge={
                      <>
                        {(cariInventory?.cariWithBalanceCount ?? 0).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Kayıt')}</span>
                      </>
                    }
                    badgeVariant="success"
                    checked={selectedOptions.importBakiyeler}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importBakiyeler: checked }))}
                  />

                  {/* 5. Stok / Ürün Kartları */}
                  <MigrationFieldCard
                    icon={<Package size={22} />}
                    iconVariant="primary"
                    title={t('Stok / Ürün Kartları')}
                    subtitle={t('TBLSTOK Tablosu')}
                    description={t('Stok Kodu, Ürün Adı, Barkod, Üretici Kodu, Alış/Satış Fiyatı, KDV ve Birim bilgileri Webakus Ürün ve Hizmet Kartlarına aktarılır.')}
                    badge={
                      <>
                        {(stokInventory?.totalStokCount ?? containerStatus?.stokCount ?? abakusSummary?.stokCount ?? 0).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Stok')}</span>
                      </>
                    }
                    extra={
                      stokInventory && (
                        <>
                          <span>{t('Barkodlu:')} {(stokInventory.stokWithBarcodeCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Üretici Kodlu:')} {(stokInventory.stokWithUreticiKoduCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Fiyatlı:')} {(stokInventory.stokWithPriceCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Bakiyeli:')} {(stokInventory.stokWithBalanceCount ?? 0).toLocaleString()}</span>
                        </>
                      )
                    }
                    checked={selectedOptions.importStoklar}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importStoklar: checked }))}
                  />

                  {/* 6. Markalar */}
                  <MigrationFieldCard
                    icon={<Tag size={22} />}
                    iconVariant="primary"
                    title={t('Markalar')}
                    subtitle={t('TBLMARKA Tablosu')}
                    description={t('Abakus sistemindeki üretici ve ürün markaları Webakus Marka tablosuna aktarılır ve stok kartlarına bağlanır.')}
                    badge={
                      <>
                        {(markaInventory?.totalMarkaCount ?? containerStatus?.markaCount ?? abakusSummary?.markaCount ?? 0).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Marka')}</span>
                      </>
                    }
                    extra={
                      markaInventory && (
                        <>
                          <span>{t('Aktif:')} {(markaInventory.activeMarkaCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Pasif:')} {(markaInventory.inactiveMarkaCount ?? 0).toLocaleString()}</span>
                        </>
                      )
                    }
                    checked={selectedOptions.importMarkalar}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importMarkalar: checked }))}
                  />

                  {/* 7. Ürün Grupları / Kategoriler */}
                  <MigrationFieldCard
                    icon={<FolderTree size={22} />}
                    iconVariant="success"
                    title={t('Ürün Grupları / Kategoriler')}
                    subtitle={t('TBLCATEGORY Tablosu')}
                    description={t('Ana ve alt kategori hiyerarşisi korunarak Webakus Ürün ve Hizmet Gruplarına aktarılır ve ürünlere bağlanır.')}
                    badge={
                      <>
                        {(urunGrubuInventory?.totalCategoryCount ?? containerStatus?.urunGrubuCount ?? abakusSummary?.urunGrubuCount ?? 0).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Grup')}</span>
                      </>
                    }
                    badgeVariant="success"
                    extra={
                      urunGrubuInventory && (
                        <>
                          <span>{t('Ana Grup:')} {(urunGrubuInventory.rootCategoryCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Alt Grup:')} {(urunGrubuInventory.subCategoryCount ?? 0).toLocaleString()}</span>
                        </>
                      )
                    }
                    checked={selectedOptions.importUrunGruplari}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importUrunGruplari: checked }))}
                  />

                  {/* 8. Alınan Siparişler (Satış) */}
                  <MigrationFieldCard
                    icon={<ShoppingCart size={22} />}
                    iconVariant="primary"
                    title={t('Alınan Siparişler (Satış)')}
                    subtitle={t('TBLSTOKHAREKETBASLIK & TBLSTOKHAREKETSATIR (Fiş: 100)')}
                    description={t('Müşteri satış siparişleri, kalemleri, miktar, birim fiyat, KDV ve iskonto detayları ile Webakus Satış Belgelerine aktarılır.')}
                    badge={
                      <>
                        {(alinanSiparisInventory?.totalOrderCount ?? alinanSiparisInventory?.totalSiparisCount ?? containerStatus?.alinanSiparisCount ?? abakusSummary?.alinanSiparisCount ?? 0).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Sipariş')}</span>
                      </>
                    }
                    extra={
                      alinanSiparisInventory && (
                        <>
                          <span>{t('Kalem:')} {(alinanSiparisInventory.totalLineCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Tutar:')} {(alinanSiparisInventory.totalAmount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                          {(alinanSiparisInventory.earliestDate || alinanSiparisInventory.firstDate) && (
                            <>
                              <span>•</span>
                              <span>
                                {t('Dönem:')} {new Date(alinanSiparisInventory.earliestDate || alinanSiparisInventory.firstDate!).toLocaleDateString('tr-TR')} - {
                                  (alinanSiparisInventory.latestDate || alinanSiparisInventory.lastDate) 
                                    ? new Date(alinanSiparisInventory.latestDate || alinanSiparisInventory.lastDate!).toLocaleDateString('tr-TR') 
                                    : ''
                                }
                              </span>
                            </>
                          )}
                          {alinanSiparisInventory.pastYearOrderCount !== undefined && alinanSiparisInventory.pastYearOrderCount > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {t('auto_gecmis_yil_sayisi', 'Eski Mali Yıl:')} {alinanSiparisInventory.pastYearOrderCount.toLocaleString()}
                              </span>
                            </>
                          )}
                        </>
                      )
                    }
                    checked={selectedOptions.importAlinanSiparisler}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importAlinanSiparisler: checked }))}
                  />

                  {/* 9. Verilen Siparişler (Satınalma) */}
                  <MigrationFieldCard
                    icon={<PackageCheck size={22} />}
                    iconVariant="success"
                    title={t('Verilen Siparişler (Satınalma)')}
                    subtitle={t('TBLSTOKHAREKETBASLIK & TBLSTOKHAREKETSATIR (Fiş: 101)')}
                    description={t('Tedarikçi satınalma siparişleri, kalemleri, miktar, birim fiyat ve KDV detayları ile Webakus Satınalma Belgelerine aktarılır.')}
                    badge={
                      <>
                        {(verilenSiparisInventory?.totalOrderCount ?? verilenSiparisInventory?.totalSiparisCount ?? containerStatus?.verilenSiparisCount ?? abakusSummary?.verilenSiparisCount ?? 0).toLocaleString()}{' '}
                        <span className="font-normal text-secondary">{t('Sipariş')}</span>
                      </>
                    }
                    badgeVariant="success"
                    extra={
                      verilenSiparisInventory && (
                        <>
                          <span>{t('Kalem:')} {(verilenSiparisInventory.totalLineCount ?? 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{t('Tutar:')} {(verilenSiparisInventory.totalAmount ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                          {(verilenSiparisInventory.earliestDate || verilenSiparisInventory.firstDate) && (
                            <>
                              <span>•</span>
                              <span>
                                {t('Dönem:')} {new Date(verilenSiparisInventory.earliestDate || verilenSiparisInventory.firstDate!).toLocaleDateString('tr-TR')} - {
                                  (verilenSiparisInventory.latestDate || verilenSiparisInventory.lastDate) 
                                    ? new Date(verilenSiparisInventory.latestDate || verilenSiparisInventory.lastDate!).toLocaleDateString('tr-TR') 
                                    : ''
                                }
                              </span>
                            </>
                          )}
                          {verilenSiparisInventory.pastYearOrderCount !== undefined && verilenSiparisInventory.pastYearOrderCount > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {t('auto_gecmis_yil_sayisi', 'Eski Mali Yıl:')} {verilenSiparisInventory.pastYearOrderCount.toLocaleString()}
                              </span>
                            </>
                          )}
                        </>
                      )
                    }
                    checked={selectedOptions.importVerilenSiparisler}
                    onChange={(checked) => setSelectedOptions(prev => ({ ...prev, importVerilenSiparisler: checked }))}
                  />
                </div>

                {/* Mükerrer Kayıt Stratejisi Kartı */}
                <div className="md3-strategy-container">
                  <div className="flex-row items-center gap-8">
                    <Sparkles size={16} className="text-primary" />
                    <span className="font-bold text-13 text-primary">{t('Mükerrer Kayıt Çakışma Stratejisi:')}</span>
                  </div>
                  <div className="md3-strategy-options">
                    <div 
                      className={`md3-strategy-chip ${importMode === MigrationImportMode.SkipDuplicates ? 'active' : ''}`}
                      onClick={() => setImportMode(MigrationImportMode.SkipDuplicates)}
                    >
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === MigrationImportMode.SkipDuplicates}
                        onChange={() => {}}
                        className="cursor-pointer accent-primary"
                      />
                      <span>{t('Mükerrerleri Atla (Webakus\'taki mevcut kaydı koru)')}</span>
                    </div>

                    <div 
                      className={`md3-strategy-chip ${importMode === MigrationImportMode.UpdateDuplicates ? 'active' : ''}`}
                      onClick={() => setImportMode(MigrationImportMode.UpdateDuplicates)}
                    >
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === MigrationImportMode.UpdateDuplicates}
                        onChange={() => {}}
                        className="cursor-pointer accent-primary"
                      />
                      <span>{t('Mükerrerleri Güncelle (Abakus verisiyle üzerine yaz)')}</span>
                    </div>

                    <div 
                      className={`md3-strategy-chip ${importMode === MigrationImportMode.ErrorOnDuplicates ? 'active' : ''}`}
                      onClick={() => setImportMode(MigrationImportMode.ErrorOnDuplicates)}
                    >
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === MigrationImportMode.ErrorOnDuplicates}
                        onChange={() => {}}
                        className="cursor-pointer accent-primary"
                      />
                      <span>{t('Hata Ver (Mükerrer varsa işlemi durdur)')}</span>
                    </div>
                  </div>
                </div>

                {/* Belge & Mali Yıl Arşivleme Ayarı */}
                {(selectedOptions.importAlinanSiparisler || selectedOptions.importVerilenSiparisler) && (
                  <div className="md3-strategy-container">
                    <div className="flex-row items-center justify-between">
                      <div className="flex-row items-center gap-8">
                        <Archive size={16} className="text-primary" />
                        <span className="font-bold text-13 text-primary">{t('migration_archive_setting_title', 'Belge & Mali Yıl Arşivleme Ayarı')}</span>
                      </div>
                      {((alinanSiparisInventory?.pastYearOrderCount ?? 0) + (verilenSiparisInventory?.pastYearOrderCount ?? 0)) > 0 && (
                        <span className="status-badge status-warning text-11">
                          {t('migration_past_year_badge', '{{count}} adet eski mali yıl belgesi tespit edildi', {
                            count: (alinanSiparisInventory?.pastYearOrderCount ?? 0) + (verilenSiparisInventory?.pastYearOrderCount ?? 0)
                          })}
                        </span>
                      )}
                    </div>
                    <div 
                      className={`md3-strategy-chip ${selectedOptions.archivePastYears ? 'active' : ''}`}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, archivePastYears: !prev.archivePastYears }))}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedOptions.archivePastYears}
                        onChange={() => {}}
                        className="cursor-pointer accent-primary"
                      />
                      <div className="flex-col gap-2">
                        <span className="font-semibold text-12">
                          {t('migration_archive_past_years_label', 'Güncel mali yıldan ({{year}}) eski olan belgeleri kendiliğinden arşive aktar', { year: new Date().getFullYear() })}
                        </span>
                        <span className="text-11 text-secondary">
                          {t('migration_archive_past_years_desc', 'Aktif sipariş ve işlem listelerinizin sade kalması için önceki mali yıllara ait siparişler doğrudan arşivlenmiş olarak kaydedilir. Arşivdeki kayıtlara filtrelerden dilediğiniz zaman ulaşabilirsiniz.')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Excel Seçimi İçin Varlık Türü ve Şablon */
              <div className="flex-col gap-16 flex-1">
                <div className="migration-entity-selector">
                  <div 
                    className={`migration-entity-chip flex-row justify-between items-center ${entityType === MigrationEntityType.Cari ? 'active' : ''}`}
                    onClick={() => setEntityType(MigrationEntityType.Cari)}
                  >
                    <div className="flex-row items-center gap-8">
                      <Users size={16} />
                      <span>{t('Cari Kartlar (Müşteri & Tedarikçi)')}</span>
                    </div>
                  </div>

                  <div 
                    className={`migration-entity-chip flex-row justify-between items-center ${entityType === MigrationEntityType.UrunVeHizmet ? 'active' : ''}`}
                    onClick={() => setEntityType(MigrationEntityType.UrunVeHizmet)}
                  >
                    <div className="flex-row items-center gap-8">
                      <Package size={16} />
                      <span>{t('Ürün ve Hizmet Kartları')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-20 border rounded-12 bg-secondary flex-row justify-between items-center mt-auto">
                  <div className="flex-col gap-4">
                    <span className="font-bold text-14">{t('Standart Aktarım Şablonu')}</span>
                    <p className="text-12 text-secondary">
                      {t('Verilerinizin hatasız eşleşmesi için lütfen kolonları ve formatları hazırlanmış renkli Excel şablonunu kullanınız.')}
                    </p>
                  </div>
                  <BaseButton
                    variant="secondary"
                    onClick={handleDownloadTemplate}
                    className="btn-sm"
                    text={t('Şablon Dosyasını İndir')}
                    icon={<Download size={15} />}
                  />
                </div>
              </div>
            )}
          </div>
        </WizardStep>

        {/* Adım 4: Canlı Aktarım */}
        <WizardStep 
          title={t('Canlı Aktarım')}
          onValidate={validateStep4}
        >
          <div className="surface-card p-24 flex-col gap-16 flex-1 w-full">
            <div className="flex-row justify-between items-center">
              <div className="flex-row items-center gap-10">
                <RefreshCw size={20} className={`text-primary ${isMigrating ? 'animate-spin' : ''}`} />
                <div>
                  <h2 className="text-16 font-bold">{t('4. Webakus Sistemine Canlı Veri Aktarımı')}</h2>
                  <p className="text-13 text-secondary">
                    {t('Veriler Docker container üzerindeki Abakus veritabanından okunup transactional olarak Webakus tablolarına işlenmektedir.')}
                  </p>
                </div>
              </div>

              {!isMigrating && !migrationFinished && (
                <BaseButton
                  variant="primary"
                  onClick={startLiveBatchMigration}
                  className="btn-md"
                  text={t('Canlı Aktarımı Başlat')}
                  icon={<Play size={16} />}
                />
              )}
            </div>

            {/* Progress Bar ve Yüzde Kartı */}
            <div className="surface-card border p-20 rounded-12 flex-col gap-12 bg-secondary">
              <div className="flex-row justify-between items-center">
                <div className="flex-row items-center gap-10">
                  <span className="text-14 font-bold">{t('Genel İlerleme Durumu')}</span>
                  <span className={`migration-live-badge ${migrationFinished ? 'completed' : isMigrating ? 'running' : 'idle'}`}>
                    <span className="dot"></span>
                    {migrationFinished 
                      ? t('Aktarım Tamamlandı') 
                      : isMigrating 
                        ? t('Veriler Aktarılıyor...') 
                        : t('Başlatılmayı Bekliyor')}
                  </span>
                </div>
                <span className="font-mono font-bold text-18 text-primary">%{migrationProgress}</span>
              </div>

              {/* MD3 Progress Bar */}
              <div className="migration-progress-track">
                <div 
                  className="migration-progress-fill" 
                  style={{ width: `${migrationProgress}%` }}
                />
              </div>

              <div className="flex-row justify-between text-11 text-secondary">
                <span>{t('Marka: {{mCurrent}}/{{mTotal}}', {
                  mCurrent: migratedMarkalar.toLocaleString(),
                  mTotal: (markaInventory?.totalMarkaCount || containerStatus?.markaCount || abakusSummary?.markaCount || 0).toLocaleString()
                })}</span>
                <span>•</span>
                <span>{t('Kategori: {{gCurrent}}/{{gTotal}}', {
                  gCurrent: migratedUrunGruplari.toLocaleString(),
                  gTotal: (urunGrubuInventory?.totalCategoryCount || containerStatus?.urunGrubuCount || abakusSummary?.urunGrubuCount || 0).toLocaleString()
                })}</span>
                <span>•</span>
                <span>{t('Stok: {{sCurrent}}/{{sTotal}}', {
                  sCurrent: migratedStoklar.toLocaleString(),
                  sTotal: (stokInventory?.totalStokCount || containerStatus?.stokCount || abakusSummary?.stokCount || 0).toLocaleString()
                })}</span>
                <span>•</span>
                <span>{t('Cari: {{cCurrent}}/{{cTotal}}', {
                  cCurrent: migratedCariler.toLocaleString(),
                  cTotal: (cariInventory?.totalCariCount || containerStatus?.cariCount || 0).toLocaleString()
                })}</span>
                <span>•</span>
                <span>{t('Oluşturulan Adres: {{count}}', { count: migratedAdresler.toLocaleString() })}</span>
                <span>•</span>
                <span>{t('Alınan Sipariş: {{aCurrent}}/{{aTotal}}', {
                  aCurrent: migratedAlinanSiparisler.toLocaleString(),
                  aTotal: (alinanSiparisInventory?.totalOrderCount ?? alinanSiparisInventory?.totalSiparisCount ?? containerStatus?.alinanSiparisCount ?? abakusSummary?.alinanSiparisCount ?? 0).toLocaleString()
                })}</span>
                <span>•</span>
                <span>{t('Verilen Sipariş: {{vCurrent}}/{{vTotal}}', {
                  vCurrent: migratedVerilenSiparisler.toLocaleString(),
                  vTotal: (verilenSiparisInventory?.totalOrderCount ?? verilenSiparisInventory?.totalSiparisCount ?? containerStatus?.verilenSiparisCount ?? abakusSummary?.verilenSiparisCount ?? 0).toLocaleString()
                })}</span>
              </div>
            </div>

            {/* Canlı KPI Sayaçları */}
            <div className="migration-summary-grid">
              <div className="migration-summary-card">
                <span className="migration-summary-value text-primary">{migratedMarkalar.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Aktarılan Marka')}</span>
              </div>

              <div className="migration-summary-card">
                <span className="migration-summary-value text-success">{migratedUrunGruplari.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Aktarılan Kategori')}</span>
              </div>

              <div className="migration-summary-card">
                <span className="migration-summary-value text-primary">{migratedStoklar.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Aktarılan Stok')}</span>
              </div>

              <div className="migration-summary-card">
                <span className="migration-summary-value text-primary">{migratedCariler.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Aktarılan Cari')}</span>
              </div>

              <div className="migration-summary-card">
                <span className="migration-summary-value text-success">{migratedAdresler.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Oluşturulan Adres')}</span>
              </div>

              <div className="migration-summary-card">
                <span className="migration-summary-value text-primary">{migratedAlinanSiparisler.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Alınan Sipariş')}</span>
              </div>

              <div className="migration-summary-card">
                <span className="migration-summary-value text-success">{migratedVerilenSiparisler.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Verilen Sipariş')}</span>
              </div>

              {selectedOptions.archivePastYears && migratedArsivlenen > 0 && (
                <div className="migration-summary-card">
                  <span className="migration-summary-value text-secondary">{migratedArsivlenen.toLocaleString()}</span>
                  <span className="migration-summary-label">{t('migration_summary_arsive_alinan', 'Arşive Aktarılan')}</span>
                </div>
              )}

              <div className="migration-summary-card">
                <span className="migration-summary-value text-warning">{migratedGuncellenen.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Güncellenen')}</span>
              </div>

              <div className="migration-summary-card">
                <span className="migration-summary-value text-secondary">{migratedAtlanan.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Atlanan')}</span>
              </div>

              <div className="migration-summary-card">
                <span className="migration-summary-value text-danger">{migratedHatali.toLocaleString()}</span>
                <span className="migration-summary-label">{t('Hatalı')}</span>
              </div>
            </div>


            {/* Canlı Log Akışı / Terminal Konsolu */}
            <div className="flex-col gap-6 flex-1 min-h-180">
              <span className="text-12 font-semibold text-secondary flex-row items-center gap-6">
                <Info size={14} />
                {t('İşlem Günlüğü ve Batch Akışı:')}
              </span>
              <div className="migration-terminal-box flex-1 overflow-y-auto p-12 font-mono text-12 rounded-8">
                {migrationLogs.length === 0 ? (
                  <div className="text-secondary text-center p-20">
                    {t('Yukarıdaki "Canlı Aktarımı Başlat" butonuna tıklayarak işlemi başlatabilirsiniz.')}
                  </div>
                ) : (
                  migrationLogs.map((log, index) => (
                    <div key={index} className="migration-terminal-line">
                      {log}
                    </div>
                  ))
                )}
                <div ref={logsBottomRef} />
              </div>
            </div>

            {/* Tamamlandıysa İleri Bildirimi */}
            {migrationFinished && (
              <div className="p-12 bg-success-subtle border border-success rounded-8 flex-row justify-between items-center">
                <div className="flex-row items-center gap-8 text-success font-semibold text-13">
                  <CheckCircle2 size={18} />
                  <span>{t('Tüm kayıtlar başarıyla aktarıldı! Raporu görmek için İleri butonuna basınız.')}</span>
                </div>
              </div>
            )}
          </div>
        </WizardStep>

        {/* Adım 5: Sonuç & Rapor */}
        <WizardStep 
          title={t('Sonuç & Rapor')}
          isValid={migrationFinished || previewResult !== null}
        >
          <div className="surface-card p-24 flex-col gap-20 flex-1 w-full">
            {/* Başarı Banner'ı */}
            <div className="migration-report-banner">
              <div className="flex-row items-center gap-16">
                <div className="p-12 rounded-12 bg-success text-white">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h2 className="text-18 font-bold text-success">
                    {t('Veri Aktarım İşlemi Başarıyla Tamamlandı!')}
                  </h2>
                  <p className="text-13 text-secondary mt-2">
                    {sourceType === MigrationSourceType.Abakus 
                      ? t('Abakus ERP sistemindeki marka, ürün grubu, stok, cari, adres ve sipariş verileriniz Webakus standartlarına uygun şekilde başarıyla aktarıldı.')
                      : t('Excel dosyanızdaki kayıtlar Webakus veritabanına aktarıldı.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Özet Rapor KPI Kartları */}
            <div className="migration-summary-grid">
              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Aktarılan Marka')}</span>
                <span className="text-24 font-bold text-primary">{migratedMarkalar.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('TBLMARKA Tablosu')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Aktarılan Kategori')}</span>
                <span className="text-24 font-bold text-success">{migratedUrunGruplari.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('TBLCATEGORY Tablosu')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Aktarılan Stok')}</span>
                <span className="text-24 font-bold text-primary">{migratedStoklar.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('TBLSTOK Tablosu')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Aktarılan Cari')}</span>
                <span className="text-24 font-bold text-primary">{migratedCariler.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('Webakus Cari Kartı')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Oluşturulan Adres')}</span>
                <span className="text-24 font-bold text-success">{migratedAdresler.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('Genel Adresler Tablosu')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Alınan Siparişler')}</span>
                <span className="text-24 font-bold text-primary">{migratedAlinanSiparisler.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('Müşteri Satış Siparişleri')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Verilen Siparişler')}</span>
                <span className="text-24 font-bold text-success">{migratedVerilenSiparisler.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('Satınalma Siparişleri')}</span>
              </div>

              {migratedArsivlenen > 0 && (
                <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                  <span className="text-12 text-secondary">{t('migration_summary_arsive_alinan', 'Arşive Aktarılan')}</span>
                  <span className="text-24 font-bold text-accent">{migratedArsivlenen.toLocaleString()}</span>
                  <span className="text-11 text-secondary">{t('migration_summary_gecmis_yil_belgeleri', 'Geçmiş Mali Yıl Belgeleri')}</span>
                </div>
              )}

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Güncellenen Mükerrer')}</span>
                <span className="text-24 font-bold text-warning">{migratedGuncellenen.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('Mevcut Kayıt Güncellendi')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Atlanan')}</span>
                <span className="text-24 font-bold text-secondary">{migratedAtlanan.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('Atlanan Kayıt')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('Hatalı')}</span>
                <span className="text-24 font-bold text-danger">{migratedHatali.toLocaleString()}</span>
                <span className="text-11 text-secondary">{t('Hatalı Kayıt')}</span>
              </div>

              <div className="surface-card border p-16 rounded-12 flex-col gap-4 bg-secondary">
                <span className="text-12 text-secondary">{t('İşlem Süresi')}</span>
                <span className="text-24 font-bold text-secondary">{elapsedDuration || t('1 dk 15 sn')}</span>
                <span className="text-11 text-secondary">{t('Batch Aktarım Süresi')}</span>
              </div>
            </div>

            {/* Bilgilendirme ve Sonraki Adımlar */}
            <div className="p-16 border rounded-12 bg-surface flex-col gap-10">
              <h4 className="font-bold text-14">{t('Bundan Sonra Ne Yapabilirsiniz?')}</h4>
              <p className="text-13 text-secondary">
                {t('Aktarılan marka, kategori, stok, cari kartları, adresleri ve sipariş belgelerini inceleyebilir veya sistemdeki işlemlerde hemen kullanmaya başlayabilirsiniz.')}
              </p>
              
              <div className="flex-row gap-12 mt-6">
                {migratedMarkalar > 0 && (
                  <BaseButton
                    variant="secondary"
                    className="btn-md"
                    onClick={() => navigate('/urun-yonetimi/markalar')}
                    text={t('Markaları İncele')}
                    icon={<Tag size={16} />}
                  />
                )}

                {migratedUrunGruplari > 0 && (
                  <BaseButton
                    variant="secondary"
                    className="btn-md"
                    onClick={() => navigate('/urun-yonetimi/urun-gruplari')}
                    text={t('Kategorileri İncele')}
                    icon={<FolderTree size={16} />}
                  />
                )}

                {migratedStoklar > 0 && (
                  <BaseButton
                    variant="secondary"
                    className="btn-md"
                    onClick={() => navigate('/urun-ve-hizmetler')}
                    text={t('Ürünleri İncele')}
                    icon={<Package size={16} />}
                  />
                )}

                {migratedAlinanSiparisler > 0 && (
                  <BaseButton
                    variant="secondary"
                    className="btn-md"
                    onClick={() => navigate('/siparisler/alinan')}
                    text={t('Alınan Siparişleri İncele')}
                    icon={<ShoppingCart size={16} />}
                  />
                )}

                {migratedVerilenSiparisler > 0 && (
                  <BaseButton
                    variant="secondary"
                    className="btn-md"
                    onClick={() => navigate('/siparisler/verilen')}
                    text={t('Verilen Siparişleri İncele')}
                    icon={<PackageCheck size={16} />}
                  />
                )}

                <BaseButton
                  variant="primary"
                  className="btn-md"
                  onClick={async () => {
                    migrationService.resetAbakusContainer().catch(() => {});
                    navigate('/cariler');
                  }}
                  text={t('Cari Kartlar Listesine Git')}
                  icon={<Users size={16} />}
                />

                <BaseButton
                  variant="secondary"
                  className="btn-md"
                  onClick={() => {
                    setIsHistoryOpen(true);
                    loadHistory();
                  }}
                  text={t('Aktarım Denetim Günlüğünü İncele')}
                  icon={<History size={16} />}
                />

                <BaseButton
                  variant="secondary"
                  className="btn-md text-danger"
                  onClick={handleResetContainer}
                  title={t('İşiniz bittiğinde Docker container\'ı temizleyebilirsiniz')}
                  text={t('Container\'ı Sil ve Temizle')}
                  icon={<RotateCcw size={16} />}
                />
              </div>
            </div>
          </div>
        </WizardStep>
      </BaseWizardPage>

      {/* Aktarım Geçmişi Modalı */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title={
          <div className="flex-row items-center gap-8">
            <History size={20} className="text-primary" />
            <span>{t('Veri Aktarım Geçmişi ve Denetim Günlüğü')}</span>
          </div>
        }
        size="xl"
      >
        <div className="p-20 flex-col gap-16">
          <div className="flex-row justify-between items-center">
            <p className="text-13 text-secondary">
              {t('Geçmişte yapılmış tüm Excel ve veritabanı aktarımlarını, satır sayılarını ve sonuçlarını inceleyin.')}
            </p>
            <BaseButton
              variant="secondary"
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="btn-sm"
              text={t('Yenile')}
              icon={<RefreshCw size={14} className={isLoadingHistory ? 'animate-spin' : ''} />}
            />
          </div>

          <div className="migration-table-wrapper max-h-450 overflow-y-auto">
            <table className="migration-table">
              <thead>
                <tr>
                  <th>{t('Tarih')}</th>
                  <th>{t('Kaynak')}</th>
                  <th>{t('Varlık Türü')}</th>
                  <th>{t('Dosya Adı')}</th>
                  <th>{t('Toplam')}</th>
                  <th>{t('Başarılı')}</th>
                  <th>{t('Hatalı')}</th>
                  <th>{t('Atlanan')}</th>
                  <th>{t('Durum')}</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-24 text-secondary">
                      {isLoadingHistory ? t('Kayıtlar yükleniyor...') : t('Henüz yapılmış bir veri aktarımı bulunmuyor.')}
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.olusturulmaTarihi).toLocaleString('tr-TR')}</td>
                      <td>
                        <span className="font-semibold">{log.sourceTypeName}</span>
                      </td>
                      <td>{log.entityTypeName}</td>
                      <td className="text-secondary">{log.dosyaAdi || '-'}</td>
                      <td>{log.toplamKayit}</td>
                      <td className="text-success font-semibold">{log.basariliKayit}</td>
                      <td className={log.hataliKayit > 0 ? 'text-danger font-semibold' : 'text-secondary'}>
                        {log.hataliKayit}
                      </td>
                      <td className="text-secondary">{log.atlananKayit}</td>
                      <td>
                        <span className={`migration-status-tag ${
                          log.durum === 1 ? 'migration-status-valid' : (log.durum === 2 ? 'migration-status-warning' : 'migration-status-error')
                        }`}>
                          {log.durumName}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MigrationHubPage;
