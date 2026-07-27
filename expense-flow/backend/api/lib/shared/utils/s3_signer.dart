import 'dart:convert';
import 'package:crypto/crypto.dart';

class S3Signer {
  static List<int> _hmacSHA256(List<int> key, List<int> data) {
    final hmac = Hmac(sha256, key);
    return hmac.convert(data).bytes;
  }

  static List<int> _getSigningKey(
    String secretKey,
    String date,
    String region,
    String service,
  ) {
    final kDate = _hmacSHA256(utf8.encode('AWS4$secretKey'), utf8.encode(date));
    final kRegion = _hmacSHA256(kDate, utf8.encode(region));
    final kService = _hmacSHA256(kRegion, utf8.encode(service));
    final kSigning = _hmacSHA256(kService, utf8.encode('aws4_request'));
    return kSigning;
  }

  static String _hexEncode(List<int> bytes) {
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }

  static Map<String, String> signPutRequest({
    required String host,
    required String path,
    required String accessKey,
    required String secretKey,
    required String region,
    required List<int> payloadBytes,
    DateTime? time,
  }) {
    final timestamp = time ?? DateTime.now().toUtc();
    final date = timestamp.toIso8601String().substring(0, 10).replaceAll('-', '');
    final amzDate = timestamp.toIso8601String().split('.').first.replaceAll('-', '').replaceAll(':', '') + 'Z';
    final payloadHash = sha256.convert(payloadBytes).toString();

    final canonicalHeaders = 'host:$host\nx-amz-content-sha256:$payloadHash\nx-amz-date:$amzDate\n';
    final signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    final canonicalRequest = 'PUT\n$path\n\n$canonicalHeaders\n$signedHeaders\n$payloadHash';
    final hashedCanonicalRequest = sha256.convert(utf8.encode(canonicalRequest)).toString();

    final credentialScope = '$date/$region/s3/aws4_request';
    final stringToSign = 'AWS4-HMAC-SHA256\n$amzDate\n$credentialScope\n$hashedCanonicalRequest';

    final signingKey = _getSigningKey(secretKey, date, region, 's3');
    final signature = _hexEncode(_hmacSHA256(signingKey, utf8.encode(stringToSign)));

    final authHeader = 'AWS4-HMAC-SHA256 Credential=$accessKey/$credentialScope, SignedHeaders=$signedHeaders, Signature=$signature';

    return {
      'Authorization': authHeader,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
    };
  }
}
