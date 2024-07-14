const { JIFFClient, JIFFClientBigNumber } = require('jiff-mpc');
let jiffClient = null;

function connect() {
  const computation_id = $('#computation_id').val();
  const party_id = parseInt($('#party_id').val());
  
  $('#output').append('<p>嘗試連接...</p>');

  jiffClient = new JIFFClient('http://localhost:8080', computation_id, {
    party_id: party_id,
    party_count: 2,
    crypto_provider: true,
    onError: function (_, error) {
      $('#output').append("<p class='error'>"+error+'</p>');
    },
    onConnect: function () {
      $('#button').attr('disabled', false);
      $('#output').append('<p>連接成功！您是' + (party_id === 1 ? '資方' : '勞方') + '</p>');
    }
  });
  jiffClient.apply_extension(JIFFClientBigNumber, {});
  jiffClient.connect();
}

async function submit() {
  const salary = parseInt($('#salary').val());
  
  if (isNaN(salary) || salary < 0) {
    $('#output').append("<p class='error'>請輸入有效的非負薪資數字！</p>");
    return;
  }

  $('#button').attr('disabled', true);
  $('#output').append('<p>開始計算...</p>');

  try {
    $('#output').append('<p>分享薪資值...</p>');
    let shares = await jiffClient.share(salary);
    
    $('#output').append('<p>執行比較操作...</p>');
    // 資方的薪資 >= 勞方的薪資要求
    let agreement = shares[1].sgteq(shares[2]);

    $('#output').append('<p>等待結果...</p>');
    const result = await jiffClient.open(agreement);
    console.log(result)
    console.log(result.toNumber())
    const isAgreement = result.toNumber() === 1; // 如果結果是 1，則表示同意
    if (isAgreement) {
      $('#output').append('<p>談判成功！資方薪資大於或等於勞方要求。</p>');
    } else {
      $('#output').append('<p>談判失敗。資方薪資低於勞方要求。</p>');
    }
  } catch (error) {
    $('#output').append("<p class='error'>計算過程中出錯: " + error.message + "</p>");
    console.error("詳細錯誤信息:", error);
  } finally {
    $('#button').attr('disabled', false);
  }
}

module.exports = {
  connect: connect,
  submit: submit
};