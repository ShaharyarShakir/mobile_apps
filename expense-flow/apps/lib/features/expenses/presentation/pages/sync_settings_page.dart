import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:drift/drift.dart' hide Column;
import 'package:mobile/core/database/local_database.dart';
import 'package:mobile/core/providers/providers.dart';
import 'package:mobile/core/services/connectivity_service.dart';
import 'package:mobile/core/services/sync_service.dart';
import 'package:mobile/shared/widgets/primary_button.dart';

final syncQueueItemsProvider = StreamProvider<List<SyncQueueData>>((ref) {
  final database = ref.read(databaseProvider);
  return (database.select(database.syncQueue)
        ..orderBy([(t) => OrderingTerm(expression: t.id)]))
      .watch();
});

final lastSyncTimeProvider = FutureProvider.autoDispose<String?>((ref) async {
  const storage = FlutterSecureStorage();
  return storage.read(key: 'lastSyncAt');
});

class SyncSettingsPage extends ConsumerWidget {
  const SyncSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(connectivityServiceProvider);
    final isSyncing = ref.watch(syncServiceProvider);
    final queueItemsAsync = ref.watch(syncQueueItemsProvider);
    final lastSyncAsync = ref.watch(lastSyncTimeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sync Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: isOnline
                          ? Colors.green.withOpacity(0.15)
                          : Colors.grey.withOpacity(0.15),
                      child: Icon(
                        isOnline ? Icons.cloud_queue : Icons.cloud_off,
                        color: isOnline ? Colors.green : Colors.grey,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isOnline ? 'Online' : 'Offline',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            isOnline
                                ? 'Database will synchronize automatically'
                                : 'Running in local cache mode',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.outline,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Diagnostic Stats',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.history),
                    title: const Text('Last Synchronization'),
                    trailing: lastSyncAsync.when(
                      data: (time) {
                        if (time == null) return const Text('Never');
                        final date = DateTime.parse(time);
                        return Text(
                          '${date.day}/${date.month} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}',
                        );
                      },
                      loading: () => const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      error: (_, __) => const Text('Error'),
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.queue),
                    title: const Text('Queued Operations'),
                    trailing: queueItemsAsync.when(
                      data: (items) => CircleAvatar(
                        radius: 12,
                        backgroundColor: items.isEmpty
                            ? Colors.grey.shade300
                            : Colors.orangeAccent,
                        child: Text(
                          items.length.toString(),
                          style: TextStyle(
                            fontSize: 11,
                            color: items.isEmpty ? Colors.black : Colors.white,
                          ),
                        ),
                      ),
                      loading: () => const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      error: (_, __) => const Text('Error'),
                    ),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.sync_problem),
                    title: const Text('Failed Tasks'),
                    trailing: queueItemsAsync.when(
                      data: (items) {
                        final failedCount =
                            items.where((i) => i.retryCount >= 4).length;
                        return CircleAvatar(
                          radius: 12,
                          backgroundColor: failedCount == 0
                              ? Colors.grey.shade300
                              : Colors.redAccent,
                          child: Text(
                            failedCount.toString(),
                            style: TextStyle(
                              fontSize: 11,
                              color: failedCount == 0 ? Colors.black : Colors.white,
                            ),
                          ),
                        );
                      },
                      loading: () => const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      error: (_, __) => const Text('Error'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            PrimaryButton(
              text: isSyncing ? 'Syncing...' : 'Sync Now',
              isLoading: isSyncing,
              onPressed: isOnline && !isSyncing
                  ? () async {
                      await ref.read(syncServiceProvider.notifier).sync();
                      ref.invalidate(lastSyncTimeProvider);
                    }
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
