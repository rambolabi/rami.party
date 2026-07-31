/* ============================================================================
   data-example.js — sample message used by the "Load an example" button.
   A deliberately phishing-style email: brand-spoofed From (paypal.com) that
   fails SPF/DKIM/DMARC, mismatched Reply-To/Return-Path, a risky TLD, and a
   body containing a tracking pixel + credential-phishing link.
   ============================================================================ */

const EXAMPLE_EMAIL = `Received: from mail.suspicious-domain.xyz (mail.suspicious-domain.xyz [45.83.12.9])
	by mx.google.com with ESMTPS id abc123
	for <victim@gmail.com>; Mon, 20 Jul 2026 10:15:30 -0700 (PDT)
Received: from web01.internal (web01.internal [10.0.0.9])
	by mail.suspicious-domain.xyz with ESMTP id def456; Mon, 20 Jul 2026 10:15:05 -0700
Authentication-Results: mx.google.com;
	spf=fail (google.com: domain of bounce@suspicious-domain.xyz does not designate 45.83.12.9 as permitted sender) smtp.mailfrom=suspicious-domain.xyz;
	dkim=none;
	dmarc=fail (p=REJECT) header.from=paypal.com;
	arc=none
Received-SPF: fail (google.com: domain of bounce@suspicious-domain.xyz does not designate 45.83.12.9 as permitted sender)
Return-Path: <bounce@suspicious-domain.xyz>
From: "PayPal Security" <service@paypal.com>
Reply-To: recover@account-verify.top
To: victim@gmail.com
Subject: Your account has been limited
Date: Mon, 20 Jul 2026 10:15:00 -0700
Message-ID: <9f8a7@suspicious-domain.xyz>
Content-Type: text/html; charset="utf-8"

<html><body><h2>Action required</h2>
<p>We limited your account. <a href="http://account-verify.top/login">Verify now</a>.</p>
<img src="http://track.suspicious-domain.xyz/o.gif?id=victim" width="1" height="1">
</body></html>`;
