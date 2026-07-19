class RequestId {
  final String value;
  const RequestId(this.value);

  @override
  String toString() => value;
}

class AuthenticatedUser {
  final String id;
  const AuthenticatedUser(this.id);

  @override
  String toString() => id;
}
