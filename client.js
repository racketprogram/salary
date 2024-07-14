const { JIFFClient, JIFFClientBigNumber } = require('jiff-mpc');
let jiffClient = null;

function connect() {
  const computation_id = $('#computation_id').val();
  const party_id = parseInt($('#party_id').val());
  
  $('#output').append('<p>Attempting to connect...</p>');

  jiffClient = new JIFFClient('http://localhost:8080', computation_id, {
    party_id: party_id,
    party_count: 2,
    crypto_provider: true,
    onError: function (_, error) {
      $('#output').append("<p class='error'>"+error+'</p>');
    },
    onConnect: function () {
      $('#button').attr('disabled', false);
      $('#output').append('<p>Connection successful! You are the ' + (party_id === 1 ? 'Employer' : 'Employee') + '</p>');
    }
  });
  jiffClient.apply_extension(JIFFClientBigNumber, {});
  jiffClient.connect();
}

async function submit() {
  const salary = parseInt($('#salary').val());
  
  if (isNaN(salary) || salary < 0) {
    $('#output').append("<p class='error'>Please enter a valid non-negative salary number!</p>");
    return;
  }

  $('#button').attr('disabled', true);
  $('#output').append('<p>Starting calculation...</p>');

  try {
    $('#output').append('<p>Sharing salary value...</p>');
    let shares = await jiffClient.share(salary);
    
    $('#output').append('<p>Performing comparison operation...</p>');
    // Employer's salary >= Employee's salary requirement
    let agreement = shares[1].sgteq(shares[2]);

    $('#output').append('<p>Waiting for results...</p>');
    const result = await jiffClient.open(agreement);
    const isAgreement = result.toNumber() === 1; // If the result is 1, it indicates agreement
    if (isAgreement) {
      $('#output').append('<p>Negotiation successful! Employer\'s salary is greater than or equal to Employee\'s requirement.</p>');
    } else {
      $('#output').append('<p>Negotiation failed. Employer\'s salary is lower than Employee\'s requirement.</p>');
    }
  } catch (error) {
    $('#output').append("<p class='error'>Error during calculation: " + error.message + "</p>");
    console.error("Detailed error information:", error);
  } finally {
    $('#button').attr('disabled', false);
  }
}

module.exports = {
  connect: connect,
  submit: submit
};