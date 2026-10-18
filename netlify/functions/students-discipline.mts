export default async () => {
  try {
    const res = await fetch('https://e-starssa.netlify.app/api/cron/reminders?type=students_discipline');
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = {
  schedule: "30 6 * * *"
};
