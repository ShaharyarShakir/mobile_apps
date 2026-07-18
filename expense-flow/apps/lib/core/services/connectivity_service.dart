import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

class ConnectivityService extends Notifier<bool> {
  final Connectivity _connectivity = Connectivity();
  final InternetConnection _internetConnection = InternetConnection();

  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  StreamSubscription<InternetStatus>? _internetSubscription;

  @override
  bool build() {
    _init();

    ref.onDispose(() {
      _connectivitySubscription?.cancel();
      _internetSubscription?.cancel();
    });

    return true;
  }

  Future<void> _init() async {
    final results = await _connectivity.checkConnectivity();
    await _updateStatus(results);

    _connectivitySubscription =
        _connectivity.onConnectivityChanged.listen(_updateStatus);

    _internetSubscription = _internetConnection.onStatusChange.listen((status) {
      state = status == InternetStatus.connected;
    });
  }

  Future<void> _updateStatus(List<ConnectivityResult> results) async {
    if (results.isEmpty || results.contains(ConnectivityResult.none)) {
      state = false;
      return;
    }
    final hasInternet = await _internetConnection.hasInternetAccess;
    state = hasInternet;
  }

  bool get isConnected => state;
}

final connectivityServiceProvider =
    NotifierProvider<ConnectivityService, bool>(ConnectivityService.new);
