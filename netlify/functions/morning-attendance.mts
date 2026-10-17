export default async () => {
  try {
    const res = await fetch('https://e-starssauz.netlify.app/api/cron/reminders?type=morning_attendance');
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = {
  schedule: "35 3 * * *"
};
