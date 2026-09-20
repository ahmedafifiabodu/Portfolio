# Windows Server Homelab — Evidence Rebuild Plan

Goal: turn "I ran this at Elfath Group, but I have no screenshots" into a documented,
reproducible lab that an interviewer can look at. This is a **lab reproduction**, labelled as
such everywhere. No employer data, names, or assets are used.

## 0. Ground rules

- Every published screenshot uses lab-only names: domain `lab.elasticated.dev`, users `Jane Doe`
  style, and an RFC1918 range you pick. Nothing from Elfath Group appears.
- The CV and website both say "lab reproduction of a previously operated production environment".
  The production *experience* is the claim; the lab is the *demonstration*. Never blur the two.
- Everything scripted goes in a public repo so the work is inspectable, not just photographable.

## 1. Host requirements

Hyper-V on Windows 11 Pro (already available on this machine).

| Resource | Minimum | Comfortable |
|---|---|---|
| RAM | 16 GB | 32 GB |
| Disk | 250 GB free SSD | 400 GB |
| CPU | 4 cores | 8 cores |

Exchange is the memory hog. If RAM is tight, run the Exchange phase alone with the other member
servers shut down — checkpoints make this cheap.

Media: Windows Server 2022 (or 2025) **Evaluation** ISO from the Microsoft Evaluation Center —
180 days, free, legitimate. Windows 11 Enterprise Evaluation ISO for the client VMs.
Exchange Server 2019 CU is downloadable from Microsoft; it runs unlicensed in trial mode long
enough for a lab.

## 2. Topology

```
Hyper-V host
├─ vSwitch "LAB-Internal"  (private/internal, no DHCP from the host)
│
├─ DC01      2 vCPU / 4 GB   AD DS, DNS, DHCP           10.10.10.10
├─ FS01      2 vCPU / 2 GB   File Services, DFS, shares 10.10.10.20
├─ WSUS01    2 vCPU / 4 GB   WSUS + WDS                 10.10.10.30
├─ EX01      4 vCPU / 10 GB  Exchange Server 2019       10.10.10.40
├─ CL01      2 vCPU / 4 GB   Windows 11, domain-joined  DHCP
└─ CL02      2 vCPU / 4 GB   Windows 11, bare — target for WDS imaging
```

Take a checkpoint after every phase completes. Name them `phase-1-dc`, `phase-2-dhcp`, etc.

## 3. Build phases

Each phase ends with: **screenshots captured**, **script committed**, **notes written**.

### Phase 1 — Domain controller
Install AD DS, promote to new forest `lab.elasticated.dev`. Build the OU hierarchy
(Departments → Users / Workstations / Groups / ServiceAccounts). Bulk-create users and
groups from CSV with PowerShell. Configure sites and services.

*Screenshots:* AD Users and Computers with the full OU tree expanded; a populated department OU;
AD Sites and Services; `Get-ADDomain` / `dcdiag` output; delegation dialog on an OU.

### Phase 2 — DNS and DHCP
AD-integrated forward and reverse zones, forwarders, conditional forwarder, scavenging enabled.
DHCP scope with reservations, scope options (router, DNS, domain), and DHCP authorisation in AD.

*Screenshots:* DNS Manager zone tree; SOA/scavenging tab; DHCP scope with address leases and
reservations; scope options list; `ipconfig /all` on a client showing it pulled a lease.

### Phase 3 — Group Policy baseline
Password and account lockout policy, security baseline, drive and printer mapping via GP
Preferences, desktop lockdown for a "Kiosk" OU, software deployment via MSI, one WMI-filtered
GPO and one security-filtered GPO, loopback processing on a shared machine OU.

*Screenshots:* GPMC tree with linked GPOs; a GPO's Settings report (this one is gold — it's a
readable HTML dump of everything you configured); security filtering tab; WMI filter;
`gpresult /h` from a client showing applied policies.

### Phase 4 — File server and folder security
Department shares on FS01. NTFS ACLs granted to groups only, never to users. Access-based
enumeration on. A DFS namespace fronting the shares. Auditing enabled on one sensitive folder,
then show an actual audit event after a denied access attempt.

*Screenshots:* share permissions vs NTFS permissions side by side; Advanced Security dialog
showing group-based ACEs and inheritance; `Get-Acl | Format-List` output; DFS namespace;
Event Viewer 4663 audit entry.

### Phase 5 — WSUS
Install WSUS, choose products and classifications, sync, build computer groups (Pilot /
Production / Servers), set client-side targeting by GPO, approve an update to Pilot only,
show the compliance report.

*Screenshots:* WSUS console with computer groups and compliance numbers; approval dialog;
the update report; the client-side targeting GPO setting.

### Phase 6 — WDS
Install WDS, add boot and install images, configure PXE response policy, create an unattend
answer file, then **PXE-boot CL02 and image it from nothing to a domain-joined desktop**.

*Screenshots:* WDS console with images; PXE settings; and the sequence on CL02 — PXE boot
screen → image selection → progress → finished desktop. This is the single most convincing
sequence in the whole lab because it visibly turns an empty VM into a working workstation.

### Phase 7 — Exchange
Install Exchange 2019 on EX01 (prep schema, domain, AD first). Create mailbox databases,
mailboxes for lab users, a distribution list, a shared mailbox, a transport rule (e.g. append a
disclaimer), and send a test message between two users through OWA.

*Screenshots:* Exchange Admin Center dashboard; mailbox list; database list with mount status;
mail flow / transport rule; OWA with a delivered message; `Get-MailboxDatabase` output.

### Phase 7b — Perimeter and endpoint (optional, matches the production stack)
MikroTik is available as **CHR (Cloud Hosted Router)** — a free-to-try RouterOS VM that runs on
Hyper-V. Boot it as the lab's gateway, then rebuild what you ran in production: NAT out,
address lists separating "internet allowed" from "internet denied" groups, and layer-7 or DNS-based
filtering for what the allowed group may reach. Bitdefender GravityZone offers a trial console —
enrol two lab endpoints, push a policy, trigger the EICAR test file, and show the detection.

*Screenshots:* Winbox firewall filter and NAT rule chains; the allow/deny address lists; a blocked
request from a denied client; GravityZone console with enrolled endpoints, applied policy, and one
EICAR detection in the events list.

### Phase 8 — Wrap-up
Back up a GPO set and a mailbox, restore one of each to prove recovery works. Write a one-page
runbook per service. Export all diagrams.

## 4. Capture discipline

- Screenshot at 1920×1080, PNG, windows maximised, no personal taskbar visible.
- Name files `phase-3-gpmc-security-filtering.png` — the filename becomes the caption.
- Also capture the **Settings report** HTML from GPMC and `dcdiag` / `Get-ADReplicationFailure`
  text output. Text evidence reads as more credible than screenshots to technical interviewers.
- Record one short screen capture of the WDS imaging run and one of a GPO applying after
  `gpupdate /force`. Two short clips beat twenty stills.

## 5. What gets published

| Artefact | Where |
|---|---|
| Architecture diagram (SVG, theme-aware) | Website IT section |
| Firewall rule export + endpoint policy notes | GitHub repo `/network` |
| Phase screenshots with captions | Website IT section gallery |
| PowerShell build scripts | GitHub repo `windows-server-lab` |
| GPO baseline export + Settings reports | Same repo, `/gpo` |
| Per-service runbooks | Same repo, `/docs` |
| Two short clips (WDS imaging, GPO apply) | Website, inline |

## 6. Ordering advice

Do phases 1–4 first and publish. That is already a complete, credible IT portfolio and takes a
handful of evenings. WSUS and WDS (5–6) are the next best value — WDS especially, for the visual
payoff. Exchange (7) is the heaviest lift; do it last, and only if you want messaging roles.

## 7. Certification pairing

The lab doubles as study. If you want a paper credential to sit next to it, the current Microsoft
hybrid-admin track is the closest fit to this stack — check the Microsoft Learn certification
page for what is live before committing, since the exam lineup shifts.
