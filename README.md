<p align="center">
  <img src="assets/lws-logo.png" alt="Learn with Sumit" width="180" />
</p>

<h1 align="center">Reactive Accelerator Batch 5 Assignments</h1>

<p align="center">
  এই repository-তে Reactive Accelerator Batch 5-এর সকল programming assignment-এর template file রাখা হয়েছে।
  আপনারা কাঙ্ক্ষিত branch switch করে প্রয়োজনীয় assignment template clone করে নিতে পারবেন।
</p>

---

## Repository Overview

Assignment template file-গুলো আলাদা আলাদা branch-এ রাখা হবে। প্রতিটি branch সাধারণত এই naming convention follow করবে:

```txt
assignment-1
assignment-2
assignment-3
assignment-4
```



## Branch Check করার নিয়ম

প্রথমে repository clone করুন:

```bash
git clone <repository-url>
cd <repository-folder>
```

সব branch দেখতে:

```bash
git branch -a
```

নির্দিষ্ট branch-এ switch করতে:

```bash
git switch assignment-1
```

পুরনো Git version হলে:

```bash
git checkout assignment-1
```

## Specific Branch Clone করার নিয়ম

আপনি চাইলে পুরো repository clone না করে সরাসরি নির্দিষ্ট assignment branch clone করতে পারেন:

```bash
git clone --branch assignment-1 --single-branch <repository-url>
```

অন্য assignment-এর জন্য শুধু branch name পরিবর্তন করুন:

```bash
git clone --branch assignment-2 --single-branch <repository-url>
git clone --branch assignment-3 --single-branch <repository-url>
git clone --branch assignment-4 --single-branch <repository-url>
```

## Assignment করার Procedure

প্রতিটি assignment lesson-এর description-এ আপনাদের কী করতে হবে, কী কী requirement আছে এবং কোন task complete করতে হবে, সেগুলো বিস্তারিতভাবে দেওয়া থাকবে।

Assignment video ভালোভাবে দেখার পর lesson-এর **Reference** tab-এ যান। সেখানে **GitHub** section-এর মধ্যে ঐ assignment-এর নির্দিষ্ট branch clone করার command দেওয়া থাকবে।

সাধারণ flow হবে:

1. Lesson video ভালোভাবে দেখুন।
2. Assignment requirement পড়ুন।
3. Reference tab থেকে assignment template branch clone করুন।
4. Template file বুঝে নিন।
5. নতুন project তৈরি করুন।
6. প্রয়োজন অনুযায়ী React, Node.js বা assignment-specific setup করুন।
7. HTML template ধীরে ধীরে আপনার নতুন project-এ migrate/convert করুন।
8. কাজ শেষ হলে নিজের private GitHub repository-তে push করুন।
9. Project deploy করে live link তৈরি করুন।
10. LMS platform থেকে assignment submit করুন।

## Template থেকে Project তৈরি

Assignment branch clone করলে সাধারণত শুধু HTML template পাওয়া যাবে। আপনাদের কাজ হবে সেই template-কে requirement অনুযায়ী proper project structure-এ convert করা।

উদাহরণস্বরূপ React assignment হলে:

```bash
npm create vite@latest my-assignment
cd my-assignment
npm install
```

এরপর cloned template-এর HTML/CSS/asset গুলো দেখে ধীরে ধীরে React component-এ convert করুন।

ভালো project structure maintain করার জন্য component, data, utility এবং asset আলাদা রাখার চেষ্টা করুন।

## GitHub Repository Rules

Assignment submit করার জন্য আপনার project অবশ্যই নিজের GitHub account-এর একটি **private repository**-তে push করতে হবে।

Public repository submit করা যাবে না। কোনো assignment repository public পাওয়া গেলে assignment গ্রহণ করা হবে না।

## Live Link

Assignment submit করার আগে project deploy করতে হবে। আপনি Vercel, Netlify বা আপনার পছন্দের যেকোনো hosting platform ব্যবহার করতে পারেন।

Submit করার সময় দুটি link লাগবে:

- Live site link
- GitHub private repository link

Submit করার আগে অবশ্যই live site এবং GitHub repository link নতুন tab-এ খুলে test করে নিন।

## Platform থেকে Submit করার নিয়ম

যে lesson-এ assignment আছে, সেই lesson page-এ গিয়ে assignment submit করতে হবে।

সেখানে:

1. Live site link দিন।
2. **Connect with GitHub** button-এ click করুন।
3. GitHub OAuth complete করুন।
4. যে private repository assignment হিসেবে submit করতে চান, সেটি select করুন।
5. Final submit করুন।

GitHub connect করার পর platform আপনার accessible private repository list দেখাবে। সেখান থেকে সঠিক assignment repository select করতে হবে।

## Important Submission Rules

- Assignment repository অবশ্যই private হতে হবে।
- Public repository submit করলে assignment গ্রহণ করা হবে না।
- Deadline-এর পর code change করা যাবে না।
- Deadline-এর পর code push করলে সেটি detect করা হতে পারে।
- Submit করার আগে final code push করা আছে কিনা নিশ্চিত করুন।
- Live link কাজ করছে কিনা submit করার আগে test করুন।
- GitHub repository link সঠিক কিনা verify করুন।

## Environment File Notice

Assignment project run করার জন্য যদি `.env`, `.env.local` বা অন্য কোনো environment/config file প্রয়োজন হয়, তাহলে সেই file repository-তে থাকতে হবে।

> এই নিয়মটি শুধুমাত্র assignment checking-এর জন্য প্রযোজ্য।

আমরা জানি professional project-এ secret বা credential কখনো GitHub repository-তে commit করা উচিত নয়। কিন্তু assignment review করার সময় project run করতে প্রয়োজনীয় config আমাদের দেখতে হতে পারে। তাই assignment repository অবশ্যই private রাখতে হবে।

Professional কাজের ক্ষেত্রে সবসময় proper `.gitignore` maintain করবেন এবং sensitive credential কখনো repository-তে push করবেন না।


**Best of luck with your assignment. Build carefully, submit confidently.**
