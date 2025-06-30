import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';

const execAsync = promisify(exec);

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  maxBackups: number;
  backupPath: string;
  compression: boolean;
  tables?: string[]; // Tabelas específicas ou todas
}

export interface BackupStatus {
  id: string;
  timestamp: Date;
  status: 'running' | 'completed' | 'failed';
  size?: number;
  duration?: number;
  error?: string;
  type: 'full' | 'incremental';
  filename: string;
}

export class BackupService {
  private config: BackupConfig;
  private backupHistory: BackupStatus[] = [];
  private currentBackup: BackupStatus | null = null;

  constructor(config?: Partial<BackupConfig>) {
    this.config = {
      enabled: true,
      schedule: '0 2 * * *', // Diário às 2h da manhã
      maxBackups: 7, // Manter 7 backups
      backupPath: './backups',
      compression: true,
      tables: [], // Todas as tabelas
      ...config
    };

    this.initializeBackupDirectory();
    this.scheduleBackups();
  }

  private initializeBackupDirectory(): void {
    if (!fs.existsSync(this.config.backupPath)) {
      fs.mkdirSync(this.config.backupPath, { recursive: true });
      console.log(`📁 Backup directory created: ${this.config.backupPath}`);
    }
  }

  private scheduleBackups(): void {
    if (!this.config.enabled) {
      console.log('⚠️ Backup service disabled');
      return;
    }

    console.log(`🔄 Backup scheduled: ${this.config.schedule}`);
    
    cron.schedule(this.config.schedule, async () => {
      console.log('🚀 Starting scheduled backup...');
      await this.createBackup('full');
    });

    // Backup imediato na inicialização se não houver backups
    if (this.backupHistory.length === 0) {
      setTimeout(() => {
        console.log('🚀 Starting initial backup...');
        this.createBackup('full');
      }, 5000); // Aguarda 5 segundos para o sistema estabilizar
    }
  }

  async createBackup(type: 'full' | 'incremental' = 'full'): Promise<BackupStatus> {
    if (this.currentBackup?.status === 'running') {
      throw new Error('Backup already in progress');
    }

    const backupId = `backup_${Date.now()}`;
    const timestamp = new Date();
    const filename = `${backupId}_${type}.sql${this.config.compression ? '.gz' : ''}`;
    const filepath = path.join(this.config.backupPath, filename);

    const backup: BackupStatus = {
      id: backupId,
      timestamp,
      status: 'running',
      type,
      filename
    };

    this.currentBackup = backup;
    this.backupHistory.unshift(backup);

    console.log(`📦 Starting ${type} backup: ${filename}`);

    try {
      const startTime = Date.now();

      // Comando pg_dump baseado na URL do banco
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      let command = `pg_dump "${databaseUrl}"`;
      
      // Adicionar tabelas específicas se configurado
      if (this.config.tables && this.config.tables.length > 0) {
        const tableFlags = this.config.tables.map(table => `-t ${table}`).join(' ');
        command += ` ${tableFlags}`;
      }

      // Adicionar compressão se habilitada
      if (this.config.compression) {
        command += ` | gzip`;
      }

      command += ` > "${filepath}"`;

      await execAsync(command);

      // Verificar se o arquivo foi criado
      const stats = fs.statSync(filepath);
      const duration = Date.now() - startTime;

      backup.status = 'completed';
      backup.size = stats.size;
      backup.duration = duration;

      console.log(`✅ Backup completed: ${filename} (${this.formatBytes(stats.size)}, ${duration}ms)`);

      // Limpar backups antigos
      await this.cleanOldBackups();

      return backup;

    } catch (error) {
      backup.status = 'failed';
      backup.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ Backup failed: ${backup.error}`);
      
      // Remover arquivo de backup falho se existir
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      throw error;
    } finally {
      this.currentBackup = null;
    }
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const files = fs.readdirSync(this.config.backupPath)
        .filter(file => file.startsWith('backup_'))
        .map(file => ({
          name: file,
          path: path.join(this.config.backupPath, file),
          stat: fs.statSync(path.join(this.config.backupPath, file))
        }))
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

      if (files.length > this.config.maxBackups) {
        const filesToDelete = files.slice(this.config.maxBackups);
        
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          console.log(`🗑️ Deleted old backup: ${file.name}`);
        }

        // Atualizar histórico
        this.backupHistory = this.backupHistory.slice(0, this.config.maxBackups);
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  async restoreBackup(filename: string): Promise<void> {
    const filepath = path.join(this.config.backupPath, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }

    console.log(`🔄 Starting restore from: ${filename}`);

    try {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      let command = '';
      
      if (filename.endsWith('.gz')) {
        command = `gunzip -c "${filepath}" | psql "${databaseUrl}"`;
      } else {
        command = `psql "${databaseUrl}" < "${filepath}"`;
      }

      await execAsync(command);
      
      console.log(`✅ Restore completed from: ${filename}`);
    } catch (error) {
      console.error(`❌ Restore failed: ${error}`);
      throw error;
    }
  }

  getBackupHistory(): BackupStatus[] {
    return [...this.backupHistory];
  }

  getCurrentBackup(): BackupStatus | null {
    return this.currentBackup;
  }

  getBackupStats(): {
    totalBackups: number;
    totalSize: number;
    lastBackup?: Date;
    nextBackup?: Date;
    successRate: number;
  } {
    const completed = this.backupHistory.filter(b => b.status === 'completed');
    const totalSize = completed.reduce((sum, backup) => sum + (backup.size || 0), 0);
    
    return {
      totalBackups: this.backupHistory.length,
      totalSize,
      lastBackup: this.backupHistory[0]?.timestamp,
      successRate: this.backupHistory.length > 0 ? (completed.length / this.backupHistory.length) * 100 : 0
    };
  }

  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Backup configuration updated');
  }

  async testBackup(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🧪 Testing backup system...');
      
      // Verificar se pg_dump está disponível
      await execAsync('pg_dump --version');
      
      // Verificar conexão com banco
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      // Testar conexão
      await execAsync(`psql "${databaseUrl}" -c "SELECT 1;"`);
      
      // Verificar permissões de escrita
      const testFile = path.join(this.config.backupPath, 'test.tmp');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);

      return {
        success: true,
        message: 'Backup system is healthy',
        details: {
          pgDumpAvailable: true,
          databaseConnected: true,
          writePermissions: true,
          backupPath: this.config.backupPath
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { error }
      };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async createManualBackup(description?: string): Promise<BackupStatus> {
    console.log(`🔧 Manual backup requested: ${description || 'No description'}`);
    return this.createBackup('full');
  }

  getBackupFiles(): Array<{
    name: string;
    size: number;
    created: Date;
    type: string;
  }> {
    try {
      return fs.readdirSync(this.config.backupPath)
        .filter(file => file.startsWith('backup_'))
        .map(file => {
          const filepath = path.join(this.config.backupPath, file);
          const stats = fs.statSync(filepath);
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            type: file.includes('incremental') ? 'incremental' : 'full'
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('Error reading backup files:', error);
      return [];
    }
  }
}

// Instância global do serviço de backup
export const backupService = new BackupService({
  enabled: true,
  schedule: '0 */6 * * *', // A cada 6 horas
  maxBackups: 10,
  compression: true
});

// Middleware para health check
export const backupHealthCheck = async () => {
  const stats = backupService.getBackupStats();
  const testResult = await backupService.testBackup();
  
  return {
    name: 'Backup Service',
    status: testResult.success ? 'healthy' : 'unhealthy',
    lastBackup: stats.lastBackup,
    totalBackups: stats.totalBackups,
    successRate: `${stats.successRate.toFixed(1)}%`,
    totalSize: stats.totalSize,
    details: testResult
  };
};