import { exec } from "child_process";

exec("npx tailwindcss init -p", (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});
