import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const WageGuardApp());
}

class WageGuardApp extends StatelessWidget {
  const WageGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WageGuard',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        useMaterial3: true,
      ),
      home: const MainWebViewPage(),
    );
  }
}

class MainWebViewPage extends StatefulWidget {
  const MainWebViewPage({super.key});

  @override
  State<MainWebViewPage> createState() => _MainWebViewPageState();
}

class _MainWebViewPageState extends State<MainWebViewPage> {
  late final WebViewController _controller;
  bool _isLoading = true;
  double _progress = 0.0;

  @override
  void initState() {
    super.initState();
    
    // Links to your deployed app (the Shared App URL)
    const String initialUrl = 'https://ais-pre-tlqvgvldtqkjfdfceh6iak-427632887251.europe-west2.run.app';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0F172A)) // Match deep slate background color
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _progress = progress / 100.0;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onNavigationRequest: (NavigationRequest request) async {
            // Bypass internal navigations, intercept external payments, phone hotlines, and emails
            if (request.url.startsWith('mailto:') || 
                request.url.startsWith('tel:') || 
                request.url.contains('ziina.co') ||
                request.url.contains('whatsapp') ||
                request.url.startsWith('https://wa.me')) {
              final Uri url = Uri.parse(request.url);
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(initialUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              Container(
                color: const Color(0xFF0F172A),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Circular loader following indigo/wage color guidelines
                      const CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'WageGuard – Employment rights helper',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Securing mobile environment... ${( _progress * 100).toInt()}%',
                        style: TextStyle(
                          color: Colors.grey[400],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}