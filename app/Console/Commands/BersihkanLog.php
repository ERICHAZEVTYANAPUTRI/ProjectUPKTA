<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BersihkanLog extends Command
{
    /**
     * Nama perintah Artisan.
     */
    protected $signature = 'log:bersihkan';

    /**
     * Deskripsi perintah ini.
     */
    protected $description = 'Mengosongkan semua file log di folder storage/logs';

    /**
     * Jalankan perintah.
     */
    public function handle()
    {
        $logPath = storage_path('logs');
        $files = glob($logPath . '/*.log');

        foreach ($files as $file) {
            file_put_contents($file, '');
        }

        $this->info('✅ Semua file log telah dikosongkan!');
    }
}