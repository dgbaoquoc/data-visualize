function combine_and_filter(trump_tweets, obama_tweets, tsne_data_trump, tsne_data_obama) {
  //add tsne data to trump and obama tweets
  trump_tweets = trump_tweets.map((trump_tweet, index) => Object.assign(trump_tweet, tsne_data_trump[index]))
  obama_tweets = obama_tweets.map((obama_tweet, index) => Object.assign(obama_tweet, tsne_data_obama[index]))

  //add an author property
  for(let tweet of trump_tweets){
    tweet.author = "Trump"
  }
  for(let tweet of obama_tweets){
    tweet.author = "Obama"
  }
  
  //combine all tweets into one array
  let tweets = [...trump_tweets, ...obama_tweets];
  

  //only include tweets containing one of these strings
  //Try experimenting with different search tags
  tweets = tweets.filter(tweet => ["climate", "energy", "green", "solar"].some(topic => tweet.text.includes(topic)));

  //Try out some of these other filters!
  //tweets = tweets.filter(tweet => tweet.text.includes("thank"))
  //tweets = tweets.filter(tweet => tweet.sentiment > 0.5) //positive tweets
  //tweets = tweets.filter(tweet => tweet.sentiment < 0) //negative tweets
  //tweets = tweets.filter(tweet => new Date(tweet.datetime) < new Date(2014, 0, 0))
  //tweets = tweets.filter(tweet => new Date(tweet.datetime) > new Date(2015, 6, 3) && new Date(tweet.datetime) < new Date(2015, 6, 5))

  return tweets;
}

function make_plot(tweets){
  let data = [{
    x: tweets.map(d => d.x),
    y: tweets.map(d => d.y),
    customdata: tweets.map(d => convertToParagraph(d.author + ": " + d.text, 64)),
    marker: {
      color: tweets.map(d => d.author=="Trump"?0:1), //color 0 if trump, 1 if obama
      size: 8,
      colorscale: [ //custom color scheme
        ['0.0', 'rgb(255,0,0)'], 
        ['1.0', 'rgb(0,0,255)'],
      ]
    },
    mode: 'markers',
    type: 'scatter',
    hovertemplate:
      "%{customdata}" +
      "<extra></extra>", //hide extra tooltip info
  }];

  let layout = {
    hovermode: "closest", //hover closest by default
    xaxis: {
      visible: false,
    },
    yaxis: {
      visible: false,
    }
  }

  Plotly.newPlot('plotDiv', data, layout);
}

//from https://codereview.stackexchange.com/a/171857
function convertToParagraph(sentence, maxLineLength){
  let lineLength = 0;
  sentence = sentence.split(" ")
  return sentence.reduce((result, word) => {
    if (lineLength + word.length >= maxLineLength) {
      lineLength = word.length;
      return result + `<br>${word}`;
    } else {
      lineLength += word.length + (result ? 1 : 0);
      return result ? result + ` ${word}` : `${word}`;
    }
  }, '');
}

Plotly.d3.csv("data/trump_presidential_tweets.csv", (trump_tweets) => {
  Plotly.d3.csv("data/obama_presidential_tweets.csv", (obama_tweets) => {
    Plotly.d3.csv("data/tsne_and_cluster/tsne_data_trump.csv", (tsne_data_trump) => {
      Plotly.d3.csv("data/tsne_and_cluster/tsne_data_obama.csv", (tsne_data_obama) => {
        let tweets = combine_and_filter(trump_tweets, obama_tweets, tsne_data_trump, tsne_data_obama)
        make_plot(tweets);
      });
    });
  });
});