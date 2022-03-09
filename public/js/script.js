async function turnOn() {
    document.getElementById("power").disabled = true;
    setTimeout(() => document.getElementById("power").disabled = false, 3000);
    let brightness = document.getElementById("brightness").value;
    await fetch("/lamp", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            brightness
        })
    });
}