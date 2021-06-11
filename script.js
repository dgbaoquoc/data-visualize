const head_data = [{
    "date": 1396010150000,
    "favorites": 29443,
    "id": "449525268529815552",
    "isRetweet": false,
    "retweets": 22230,
    "text": "Healthy young child goes to doctor, gets pumped with massive shot of many vaccines, doesn't feel good and changes - AUTISM. Many such cases!"
},
{
    "date": 1346165646000,
    "favorites": 8938,
    "id": "240462265680289792",
    "isRetweet": false,
    "retweets": 8412,
    "text": ".@ariannahuff is unattractive both inside and out. I lly understand why her former husband left her for a man- he made a good decision."
},
{
    "date": 1377097749000,
    "favorites": 366,
    "id": "370200907834597377",
    "isRetweet": false,
    "retweets": 422,
    "text": "The hatchet job in @NYMag about Roger Ailes is total bullshit. He is the ultimate winner who is surrounded by a great team. @FoxNews"
},
{
    "date": 1368063426000,
    "favorites": 154973,
    "id": "332308211321425920",
    "isRetweet": false,
    "retweets": 124482,
    "text": "Sorry losers and haters, but my I.Q. is one of the highest -and you all know it! Please don't feel so stupid or insecure,it's not your fault"
},
{
    "date": 1411950079000,
    "favorites": 81146,
    "id": "516382177798680576",
    "isRetweet": false,
    "retweets": 64424,
    "text": "Every time I speak of the haters and losers I do so with great love and affection. They cannot help the fact that they were born fucked up!"
}]


for (let i in head_data) {
    $(`#${i}_tweet`).html(
        `
<div class="placeholder">
                            <div class="row mb-2">
                                <div class="col-md-2">
                                    <img src="./Assets/profile-picture.jpg" alt="">
                                </div>
                                <div style="margin-left: -25px;" class="col-md-10">
                                    <h4>Donald J. Trump</h4>
                                    <span class="gray">@realdonaldtrump</span>
                                </div>
                            </div>
                            <p><span><span class="">${head_data[i].text}</span></span></p>
                            <div class="gray"><span>${moment(head_data[i].date).format('YYYY/MM/DD')}</span><span
                                    class="dot">·</span><span>Twitter for
                                    iPhone</span><span class="dot">·</span><span></span></div>
                        </div>
`
    )
}

$("#portrait").css('cursor', 'pointer')


function combine_and_filter(trump_tweets, tsne_data_trump) {
    //add tsne data to trump tweets
    trump_tweets = trump_tweets.map((trump_tweet, index) => Object.assign(trump_tweet, tsne_data_trump[index]))

    //add an author property
    for (let tweet of trump_tweets) {
        tweet.author = "Trump"
    }

    let positiveTweets = trump_tweets.filter(tweet => tweet.sentiment > 0.5 && new Date(tweet.datetime) > new Date(2018, 0, 0)) //positive tweets since 2018
    let negativeTweets = trump_tweets.filter(tweet => tweet.sentiment < 0 && new Date(tweet.datetime) > new Date(2018, 0, 0)) //negative tweets since 2018

    //combine all tweets into one array
    let tweets = [...positiveTweets, ...negativeTweets];

    return tweets
}

function make_plot(tweets) {
    let data = [{
        x: tweets.map(d => d.x),
        y: tweets.map(d => d.y),
        customdata: tweets.map(d => convertToParagraph(d.author + ": " + d.text, 64)),
        marker: {
            color: tweets.map(d => d.sentiment > 0.5 ? 1 : 0), //color 0 if negative, 1 if positive
            size: 8,
            colorscale: [ //custom color scheme
                ['0.0', 'rgb(255, 102, 102)'],
                ['1.0', 'rgb(102, 255, 153)'],
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
        },
        title: {
            text: 'Positive and Negative Tweets of Donald Trump since 2018',
            font: {
                family: 'Courier New, monospace',
                size: 20,
                color: '#7f7f7f'
            }
        }
    }

    Plotly.newPlot('plotDiv', data, layout);
}

//from https://codereview.stackexchange.com/a/171857
function convertToParagraph(sentence, maxLineLength) {
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
    Plotly.d3.csv("data/tsne_data_trump.csv", (tsne_data_trump) => {
        let tweets = combine_and_filter(trump_tweets, tsne_data_trump)
        make_plot(tweets);
    });
});