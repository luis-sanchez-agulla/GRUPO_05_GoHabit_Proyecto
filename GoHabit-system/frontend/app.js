document.getElementById('welcomeButton').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:8000/');
        const data = await response.json();
        document.getElementById('message').textContent = data.message;
    } catch (error) {
        document.getElementById('message').textContent = 'Error fetching message';
    }
});