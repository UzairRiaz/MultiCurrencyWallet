import kasaHttpClient from 'shared/helpers/kasaHttpClient';

const Fortess  = () => {
  const EJS = window.FortressElementsJS;
  const elementClient = EJS.createElementClient({
    elementName: EJS.ElementNames.KYC,
    onMessage: async (message) => {
      var mxConnect = new window.MXConnect({
        id: "connect-widget", 
        iframeTitle: "Connect",
        onEvent: function(type, payload) {
          console.log("onEvent", type, payload);
        },
        config: {
          mode: "verification",
          color_scheme: "dark",
          ui_message_version: 4
        },
        targetOrigin: "*"
      })
      const res = await kasaHttpClient.get('/user/mx-url')
       mxConnect.load(res.data.url.widgetUrl);
    },
    theme: { primaryColor: '#a8c416', secondaryColor: '#CCC' },
    uiLabels: {
      statusScreenButton: "Continue",
    },
  });

  const createUserAndLaunch = async () => {
    try {
      const res = await kasaHttpClient.get('/user//kyc-token')
      elementClient.run(res.data.token);

    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div className="App">
      <button className="starter-modal__btn starter-modal__btn_skip" onClick={() => createUserAndLaunch()}>Start KYC authentication</button>
      <div id="connect-widget"></div>
    </div>
  );
}

export default Fortess;
