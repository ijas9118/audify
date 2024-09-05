document.querySelectorAll('input[name="addressType"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.getElementById('customNameContainer').style.display = radio.id === 'custom' ? 'block' : 'none';
  });
});

document.getElementById('addressForm').addEventListener('submit', function(event) {
  const checkbox = document.getElementById('defaultAddress');
  const hiddenInput = document.querySelector('input[name="isDefault"][type="hidden"]');
  
  if (checkbox.checked) {
    hiddenInput.value = true;
  } else {
    hiddenInput.value = false;
  }
});
