if ('object' === typeof module && 'undefined' !== typeof module.exports) {
    Crontab = require('../src/crontab.js');
    Should = require('should');
}
(function() {
var timer,
    result = [],
    expectResult = [1000, 1200, 1500, 1200, 1500];
describe('crontab.js', function() {
    describe('Create a default crontab: timer = new Crontab().', function() {
        timer = new Crontab();

        it('The return value of Crontab.getInstance() must equal to timer.', function() {
            Should(Crontab.getInstance()).be.exactly(timer);
        });

        it('Add interval for 1500ms. push 1500 in result array if it run.', function() {
            timer.on(1500, function() {
                result.push(1500);
            });
        });

        it('Add interval for 1200ms. push 1200 in result array if it run.', function() {
            timer.on(1200, function() {
                result.push(1200);
            });
        });

        it('Add timeout for 1000ms. push 1000 in result array if it run.', function() {
            timer.one(1000, function() {
                result.push(1000);
            });
        });

    });

    this.timeout(5000);
    describe('Use setTimeout and time set 4000ms.', function() {
        it('In the first five item of result must be ' + expectResult.join(' '), function(done) {
            setTimeout(function() {
                result.slice(0, 5).should.eql(expectResult);
                done();
            }, 4000);
        });
    });
});
})();
